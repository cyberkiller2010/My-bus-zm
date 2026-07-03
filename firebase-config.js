// ============================================================
//  FIREBASE CONFIGURATION - my-bus-zm
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCr4LclnsMjcIUNWw1_NfLPpSJI4Y0nQds",
    authDomain: "my-bus-zm.firebaseapp.com",
    projectId: "my-bus-zm",
    storageBucket: "my-bus-zm.firebasestorage.app",
    messagingSenderId: "148999000077",
    appId: "1:148999000077:web:aba2b5a1175152db684544"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Functions
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

// Firestore Functions
async function getAllBranches() {
    try {
        const querySnapshot = await getDocs(collection(db, 'branches'));
        const branches = [];
        querySnapshot.forEach(doc => {
            branches.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: branches };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getBookingsByBranch(branchId) {
    try {
        const q = query(
            collection(db, 'bookings'), 
            where('branchId', '==', branchId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const bookings = [];
        querySnapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: bookings };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function markBookingAttended(bookingId) {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), { 
            attended: true,
            status: 'boarded',
            attendedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createBooking(data) {
    try {
        const docRef = await addDoc(collection(db, 'bookings'), {
            ...data,
            createdAt: serverTimestamp(),
            status: 'booked',
            attended: false
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function createBranch(data) {
    try {
        const docRef = await addDoc(collection(db, 'branches'), {
            ...data,
            createdAt: serverTimestamp(),
            status: 'active'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function deleteBranch(branchId) {
    try {
        await deleteDoc(doc(db, 'branches', branchId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Real-time listeners
function listenToBookings(companyId, callback) {
    const q = query(
        collection(db, 'bookings'),
        where('companyId', '==', companyId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const bookings = [];
        snapshot.forEach(doc => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        callback(bookings);
    });
}

// Export
export { 
    auth, db,
    loginUser, logoutUser, getCurrentUser,
    getAllBranches, getBookingsByBranch, markBookingAttended,
    createBooking, createBranch, deleteBranch,
    listenToBookings,
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp
};
