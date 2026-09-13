import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAuo282nYSuUuoUADo5H5ZIZR1pdiwufes',
  authDomain: 'risedifusion.firebaseapp.com',
  projectId: 'risedifusion',
  appId: '1:501416571998:web:8480b2b96828fe2202b0cf',
  messagingSenderId: '501416571998',
}

const firebaseApp = initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({ prompt: 'select_account' })
