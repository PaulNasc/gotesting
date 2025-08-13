import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AccessToken = Tables<'access_tokens'>;
export type AccessLog = Tables<'access_logs'>;
export type CreateAccessTokenData = TablesInsert<'access_tokens'>;
export type UpdateAccessTokenData = TablesUpdate<'access_tokens'>;

export interface TokenValidationResult {
  success: boolean;
  organization_id?: string;
  error?: string;
  code?: string;
  expired_at?: string;
  uses_remaining?: number;
}

export interface AccessLogWithDetails extends AccessLog {
  organization?: {
    name: string;
    database_id: string;
  };
  token?: {
    token: string;
    description: string | null;
  };
}

export class AccessTokenService {
  // Criar novo token de acesso
  static async createAccessToken(
    organizationId: string,
    description?: string,
    durationSeconds: number = 40,
    maxUses: number = 1
  ): Promise<string | null> {
    try {
      const token = `tkn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

      const { error } = await supabase
        .from('access_tokens')
        .insert({
          organization_id: organizationId,
          token,
          description,
          expires_at: expiresAt,
          max_uses: maxUses,
          current_uses: 0,
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (error) throw error;
      return token;
    } catch (error) {
      console.error('Error creating access token:', error);
      return null;
    }
  }

  // Validar e usar token
  static async validateAndUseToken(
    token: string,
    userEmail?: string,
    userIp?: string,
    userAgent?: string
  ): Promise<TokenValidationResult> {
    try {
      // Buscar token
      const { data: tokenData, error: tokenError } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();

      if (tokenError || !tokenData) {
        await this.logAccess(null, token, userEmail, userIp, userAgent, 'token_invalid', 'failed');
        return { success: false, error: 'Token não encontrado ou inválido', code: 'INVALID_TOKEN' };
      }

      // Verificar expiração
      if (new Date() > new Date(tokenData.expires_at)) {
        await this.logAccess(tokenData.organization_id, token, userEmail, userIp, userAgent, 'token_expired', 'expired');
        return { 
          success: false, 
          error: 'Token expirado', 
          code: 'EXPIRED_TOKEN',
          expired_at: tokenData.expires_at 
        };
      }

      // Verificar usos máximos
      if (tokenData.current_uses >= tokenData.max_uses) {
        await this.logAccess(tokenData.organization_id, token, userEmail, userIp, userAgent, 'token_max_uses_reached', 'failed');
        return { success: false, error: 'Token atingiu limite de usos', code: 'MAX_USES_REACHED' };
      }

      // Incrementar uso
      const { error: updateError } = await supabase
        .from('access_tokens')
        .update({ current_uses: tokenData.current_uses + 1 })
        .eq('id', tokenData.id);

      if (updateError) throw updateError;

      // Log de sucesso
      await this.logAccess(tokenData.organization_id, token, userEmail, userIp, userAgent, 'token_used', 'success');

      return { 
        success: true, 
        organization_id: tokenData.organization_id,
        uses_remaining: tokenData.max_uses - (tokenData.current_uses + 1)
      };

    } catch (error) {
      console.error('Error validating token:', error);
      return { success: false, error: 'Erro interno no servidor', code: 'INTERNAL_ERROR' };
    }
  }

  // Buscar tokens ativos de uma organização
  static async getActiveTokens(organizationId: string): Promise<AccessToken[]> {
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active tokens:', error);
      return [];
    }

    return data;
  }

  // Registrar log de acesso
  private static async logAccess(
    organizationId: string | null,
    token: string,
    userEmail?: string,
    userIp?: string,
    userAgent?: string,
    action: string = 'token_used',
    status: string = 'success'
  ): Promise<void> {
    try {
      await supabase
        .from('access_logs')
        .insert({
          organization_id: organizationId,
          token_id: null, // Pode ser preenchido se necessário
          user_email: userEmail,
          user_ip: userIp,
          user_agent: userAgent,
          action,
          status,
          details: { token_prefix: token.substring(0, 8) },
        });
    } catch (error) {
      console.error('Error logging access:', error);
    }
  }

  // Buscar logs de acesso de uma organização
  static async getAccessLogs(
    organizationId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AccessLogWithDetails[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        organization:organizations(name, database_id),
        token:access_tokens(token, description)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching access logs:', error);
      return [];
    }

    return data;
  }

  // Buscar estatísticas de logs
  static async getLogStatistics(organizationId: string): Promise<{
    total_attempts: number;
    successful_access: number;
    failed_access: number;
    expired_tokens: number;
    invalid_tokens: number;
    recent_activity: AccessLogWithDetails[];
  }> {
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        organization:organizations(name, database_id),
        token:access_tokens(token, description)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching log statistics:', error);
      return {
        total_attempts: 0,
        successful_access: 0,
        failed_access: 0,
        expired_tokens: 0,
        invalid_tokens: 0,
        recent_activity: []
      };
    }

    const total_attempts = logs.length;
    const successful_access = logs.filter(log => log.status === 'success').length;
    const failed_access = logs.filter(log => log.status === 'failed').length;
    const expired_tokens = logs.filter(log => log.action === 'token_expired').length;
    const invalid_tokens = logs.filter(log => log.action === 'token_invalid').length;

    return {
      total_attempts,
      successful_access,
      failed_access,
      expired_tokens,
      invalid_tokens,
      recent_activity: logs
    };
  }

  // Desativar token
  static async deactivateToken(tokenId: string): Promise<boolean> {
    const { error } = await supabase
      .from('access_tokens')
      .update({ is_active: false })
      .eq('id', tokenId);

    if (error) {
      console.error('Error deactivating token:', error);
      return false;
    }

    return true;
  }

  // Limpar tokens expirados
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_tokens');

      if (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  // Buscar tentativas de acesso por email
  static async getAccessAttemptsByEmail(email: string): Promise<AccessLogWithDetails[]> {
    const { data, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        organization:organizations(name, database_id),
        token:access_tokens(token, description)
      `)
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching access attempts by email:', error);
      return [];
    }

    return data;
  }

  // Verificar se token está expirado
  static isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  // Calcular tempo restante do token
  static getTokenTimeRemaining(expiresAt: string): number {
    const now = new Date();
    const expires = new Date(expiresAt);
    return Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
  }

  // Formatar tempo restante para exibição
  static formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return 'Expirado';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    return `${remainingSeconds}s`;
  }

  // Gerar token temporário para teste
  static async generateTestToken(organizationId: string): Promise<string | null> {
    return this.createAccessToken(
      organizationId,
      'Token de teste - 40 segundos',
      40,
      1
    );
  }

  // Verificar se usuário pode gerenciar tokens
  static async canManageTokens(organizationId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Error checking token management permissions:', error);
      return false;
    }

    return ['master', 'admin'].includes(data?.role || '');
  }
}
