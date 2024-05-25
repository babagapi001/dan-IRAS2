import { db } from '../firebaseConfig';

import { collection, addDoc } from 'firebase/firestore';

const updateFirestoreReport = async (timestamp, analysisResults) => {
  try {
    const timestamp = new Date().toISOString();
    const reportRef = doc(db, 'reports', 'latest'); // Replace 'latest' with your desired document ID
    await setDoc(reportRef, {
    timestamp,
    imageURL,
    });
    console.log('Report added to Firestore:', { timestamp, analysisResults });
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
};

export { updateFirestoreReport };
