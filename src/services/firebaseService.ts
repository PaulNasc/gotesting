
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TestPlan, TestCase, TestExecution } from '@/types';

// Test Plans
export const createTestPlan = async (plan: Omit<TestPlan, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'testPlans'), plan);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar plano de teste:', error);
    throw error;
  }
};

export const getTestPlans = async (userId: string): Promise<TestPlan[]> => {
  try {
    const q = query(
      collection(db, 'testPlans'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestPlan));
  } catch (error) {
    console.error('Erro ao buscar planos de teste:', error);
    throw error;
  }
};

export const updateTestPlan = async (id: string, updates: Partial<TestPlan>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'testPlans', id), updates);
  } catch (error) {
    console.error('Erro ao atualizar plano de teste:', error);
    throw error;
  }
};

export const deleteTestPlan = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'testPlans', id));
  } catch (error) {
    console.error('Erro ao deletar plano de teste:', error);
    throw error;
  }
};

// Test Cases
export const createTestCase = async (testCase: Omit<TestCase, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'testCases'), testCase);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar caso de teste:', error);
    throw error;
  }
};

export const getTestCases = async (userId: string, planId?: string): Promise<TestCase[]> => {
  try {
    let q = query(
      collection(db, 'testCases'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    if (planId) {
      q = query(
        collection(db, 'testCases'),
        where('userId', '==', userId),
        where('planId', '==', planId),
        orderBy('updatedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestCase));
  } catch (error) {
    console.error('Erro ao buscar casos de teste:', error);
    throw error;
  }
};

export const updateTestCase = async (id: string, updates: Partial<TestCase>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'testCases', id), updates);
  } catch (error) {
    console.error('Erro ao atualizar caso de teste:', error);
    throw error;
  }
};

export const deleteTestCase = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'testCases', id));
  } catch (error) {
    console.error('Erro ao deletar caso de teste:', error);
    throw error;
  }
};

// Test Executions
export const createTestExecution = async (execution: Omit<TestExecution, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'testExecutions'), execution);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar execução de teste:', error);
    throw error;
  }
};

export const getTestExecutions = async (userId: string, caseId?: string): Promise<TestExecution[]> => {
  try {
    let q = query(
      collection(db, 'testExecutions'),
      where('userId', '==', userId),
      orderBy('executedAt', 'desc')
    );

    if (caseId) {
      q = query(
        collection(db, 'testExecutions'),
        where('userId', '==', userId),
        where('caseId', '==', caseId),
        orderBy('executedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestExecution));
  } catch (error) {
    console.error('Erro ao buscar execuções de teste:', error);
    throw error;
  }
};
