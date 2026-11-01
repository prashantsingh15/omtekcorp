// ==========================================================================
// OMTEK CORPORATION - FIREBASE CLOUD INTEGRATION
// Project ID: omtechcorp-91f41
// Provides Cloud Firestore (Enquiries) & Firebase Storage (Media Uploads)
// ==========================================================================

const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_API_KEY_HERE",
  authDomain: "omtechcorp-91f41.firebaseapp.com",
  projectId: "omtechcorp-91f41",
  storageBucket: "omtechcorp-91f41.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase if SDK is loaded
let db = null;
let storage = null;

function initFirebase() {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      storage = firebase.storage();
      console.log("Firebase initialized successfully for omtechcorp-91f41");
    } catch (err) {
      console.warn("Firebase initialization notice:", err);
    }
  } else if (typeof firebase !== 'undefined' && firebase.apps.length) {
    db = firebase.firestore();
    storage = firebase.storage();
  }
}

// --------------------------------------------------------------------------
// 1. ENQUIRY HANDLING (CLOUD FIRESTORE)
// --------------------------------------------------------------------------

// Submit a new lead / proposal request directly to Cloud Firestore
async function submitEnquiryToFirebase(leadData) {
  try {
    if (db && firebaseConfig.apiKey !== "AIzaSy_YOUR_API_KEY_HERE") {
      const docRef = await db.collection("enquiries").add({
        ...leadData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("Enquiry saved to Cloud Firestore with ID:", docRef.id);
      return docRef.id;
    } else {
      // Fallback to localStorage if Firebase keys are not yet pasted
      console.log("Firebase not configured yet; saving lead to local storage.");
      return null;
    }
  } catch (error) {
    console.error("Error saving enquiry to Firestore:", error);
    return null;
  }
}

// Real-time listener for enquiries (for admin.html dashboard)
function listenEnquiriesFromFirebase(onUpdate) {
  if (db && firebaseConfig.apiKey !== "AIzaSy_YOUR_API_KEY_HERE") {
    return db.collection("enquiries")
      .orderBy("date", "desc")
      .onSnapshot((snapshot) => {
        const enquiries = [];
        snapshot.forEach((doc) => {
          enquiries.push({ docId: doc.id, ...doc.data() });
        });
        onUpdate(enquiries);
      }, (error) => {
        console.error("Error listening to Firestore enquiries:", error);
      });
  }
  return null;
}

// Update lead status in Firestore
async function updateEnquiryStatusInFirebase(docId, newStatus) {
  if (db && docId) {
    try {
      await db.collection("enquiries").doc(docId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Error updating status in Firestore:", e);
      return false;
    }
  }
  return false;
}

// Delete lead in Firestore
async function deleteEnquiryFromFirebase(docId) {
  if (db && docId) {
    try {
      await db.collection("enquiries").doc(docId).delete();
      return true;
    } catch (e) {
      console.error("Error deleting lead from Firestore:", e);
      return false;
    }
  }
  return false;
}

// --------------------------------------------------------------------------
// 2. MEDIA UPLOADS (FIREBASE STORAGE)
// --------------------------------------------------------------------------

// Upload image or video to Firebase Storage and log metadata in Firestore
async function uploadMediaToFirebase(file, metadata, onProgress, onSuccess, onError) {
  if (!storage || firebaseConfig.apiKey === "AIzaSy_YOUR_API_KEY_HERE") {
    onError(new Error("Firebase Storage is not configured yet with valid credentials."));
    return;
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `uploads/${metadata.category || 'general'}/${timestamp}_${cleanFileName}`;
    const storageRef = storage.ref().child(filePath);

    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Firebase Storage Upload Error:", error);
        if (onError) onError(error);
      },
      async () => {
        try {
          const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();
          
          // Save record in Firestore "media" collection
          const mediaDoc = {
            title: metadata.title || file.name,
            category: metadata.category || 'general',
            type: file.type.startsWith("video") ? "video" : "image",
            url: downloadUrl,
            storagePath: filePath,
            fileSize: file.size,
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };

          if (db) {
            await db.collection("media").add(mediaDoc);
          }

          if (onSuccess) onSuccess(downloadUrl, mediaDoc);
        } catch (err) {
          if (onError) onError(err);
        }
      }
    );
  } catch (error) {
    if (onError) onError(error);
  }
}

// Auto-run initialization on load
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", initFirebase);
}
