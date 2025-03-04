// src/lib/firebase/batchOperations.ts
import { 
  Firestore, 
  writeBatch, 
  doc, 
  collection, 
  getDocs, 
  query, 
  limit, 
  DocumentReference,
  WriteBatch,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { firestore } from '../firebase';

/**
 * Maximum batch size for Firestore operations
 * @see https://firebase.google.com/docs/firestore/quotas#writes_and_transactions
 */
const MAX_BATCH_SIZE = 500;

/**
 * Type for batch operations
 */
type BatchOperation = {
  type: 'delete' | 'set' | 'update';
  ref: DocumentReference;
  data?: DocumentData;
};

/**
 * Executes a batch of write operations on Firestore
 * @param operations List of operations to execute
 * @returns Promise that resolves when all operations are complete
 */
export const executeBatch = async (operations: BatchOperation[]): Promise<void> => {
  if (operations.length === 0) return;
  
  // Process operations in chunks to respect Firestore batch size limits
  const chunks: BatchOperation[][] = [];
  for (let i = 0; i < operations.length; i += MAX_BATCH_SIZE) {
    chunks.push(operations.slice(i, i + MAX_BATCH_SIZE));
  }
  
  // Execute each chunk in a separate batch
  for (const chunk of chunks) {
    const batch = writeBatch(firestore);
    
    for (const op of chunk) {
      if (op.type === 'delete') {
        batch.delete(op.ref);
      } else if (op.type === 'set' && op.data) {
        batch.set(op.ref, op.data);
      } else if (op.type === 'update' && op.data) {
        batch.update(op.ref, op.data);
      }
    }
    
    await batch.commit();
  }
};

/**
 * Deletes all documents in a collection (up to 10,000 documents)
 * @param collectionPath Path to the collection
 * @param batchSize Size of each batch (max 500)
 * @returns Promise that resolves when all documents are deleted
 */
export const deleteCollection = async (
  collectionPath: string,
  batchSize: number = MAX_BATCH_SIZE
): Promise<void> => {
  // Guard against batch size exceeding limits
  const safeBatchSize = Math.min(batchSize, MAX_BATCH_SIZE);
  
  // Reference to the collection
  const collectionRef = collection(firestore, collectionPath);
  
  // Delete in batches of batchSize
  let batchCount = 0;
  let docsDeleted = 0;
  const MAX_ITERATIONS = 20; // Safety limit to prevent infinite loops
  
  while (batchCount < MAX_ITERATIONS) {
    // Get a batch of documents
    const q = query(collectionRef, limit(safeBatchSize));
    const snapshot = await getDocs(q);
    
    // If no documents left, we're done
    if (snapshot.empty) {
      console.log(`Deleted a total of ${docsDeleted} documents from ${collectionPath}`);
      return;
    }
    
    // Delete this batch
    const batch = writeBatch(firestore);
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    // Update counters
    docsDeleted += snapshot.size;
    batchCount++;
    
    if (snapshot.size < safeBatchSize) {
      // We've deleted all documents
      console.log(`Deleted a total of ${docsDeleted} documents from ${collectionPath}`);
      return;
    }
  }
  
  console.warn(`Reached maximum number of batch operations. There may still be documents in ${collectionPath}`);
};