import React, { useState, useEffect } from 'react';
import { getDocs, query, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ImgFetch = () => {
    const [referenceImage, setReferenceImage] = useState(null);
  
    useEffect(() => {
      const fetchReferenceImage = async () => {
        // Fetch reference image URL from Firestore
        // Assuming you have a collection named 'reports' with documents containing the 'imageUrl' field
        // Fetch the latest document or the one you want to display
        const querySnapshot = await getDocs(query(collection(db, 'reports')));
        const latestDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
        const imageUrl = latestDocument.data().imageUrl;
        setReferenceImage(imageUrl);
      };
  
      fetchReferenceImage();
    }, []);
  
    return (
      <div>
        {/* Display reference image */}
        {referenceImage && <img src={referenceImage} alt="Reference Image" />}
      </div>
    );
  };
  
  export default ImgFetch;
  