// firebasefunc/firestoreFunctions.js
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const updateFirestoreReport = async (imageUrl) => {
  try {
    const timestamp = new Date().toISOString(); // Get current timestamp

    // Create data object with imageUrl
    const data = { timestamp, imageUrl };

    // Add data to Firestore collection
    await addDoc(collection(db, 'reports'), data);
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
};

export { updateFirestoreReport };