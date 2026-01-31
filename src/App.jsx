import React, { useState, useEffect } from 'react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Load SweetAlert dynamically
const loadSweetAlert = () => {
  return new Promise((resolve) => {
    if (window.Swal) {
      resolve(window.Swal);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    script.onload = () => resolve(window.Swal);
    script.onerror = () => {
      console.warn('SweetAlert failed to load, using fallback');
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1fZ85FX7NDij1SkjJKY1GGAZKsFnnMOA",
  authDomain: "resume-builder-d9ae9.firebaseapp.com",
  projectId: "resume-builder-d9ae9",
  storageBucket: "resume-builder-d9ae9.firebasestorage.app",
  messagingSenderId: "171735301835",
  appId: "1:171735301835:web:ce2345aacbd7a19309e54e",
  measurementId: "G-602NE5PNLQ"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Icons Component
const Icons = {
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Education: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M12 14l9-5-9-5-9 5 9 5z" />
      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
  ),
  Code: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Award: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Template: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  )
};

// PDF Generation Utility
const generatePDF = async (elementId, filename) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Resume element not found');
    }
    
    // Create a clone of the element
    const elementClone = element.cloneNode(true);
    
    // Apply print styles to clone
    elementClone.style.width = '210mm';
    elementClone.style.minHeight = '297mm';
    elementClone.style.margin = '0';
    elementClone.style.padding = '20mm';
    elementClone.style.boxSizing = 'border-box';
    elementClone.style.backgroundColor = 'white';
    
    // Create print container
    const printContainer = document.createElement('div');
    printContainer.style.position = 'fixed';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.appendChild(elementClone);
    document.body.appendChild(printContainer);
    
    // Wait for images to load
    const images = elementClone.getElementsByTagName('img');
    const imagePromises = [];
    for (let img of images) {
      if (!img.complete) {
        const promise = new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        imagePromises.push(promise);
      }
    }
    
    await Promise.all(imagePromises);
    
    // Generate print
    const originalTitle = document.title;
    document.title = filename;
    
    // Create print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-container, #print-container * {
          visibility: visible;
        }
        #print-container {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          padding: 0;
          margin: 0;
        }
        @page {
          margin: 20mm;
        }
        a {
          text-decoration: none;
          color: inherit;
        }
      }
    `;
    document.head.appendChild(style);
    
    printContainer.id = 'print-container';
    
    // Print the resume
    window.print();
    
    // Cleanup
    document.title = originalTitle;
    document.head.removeChild(style);
    document.body.removeChild(printContainer);
    
    return true;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

// Resume Templates Categories
const resumeTemplates = [
  {
    id: 'professional',
    name: 'Professional',
    category: 'Modern & Clean',
    description: 'Clean, modern designs perfect for corporate jobs',
    color: 'bg-blue-500',
    templates: [
      {
        id: 'professional-1',
        name: 'Classic Professional',
        style: 'simple',
        layout: 'vertical',
        accentColor: '#3b82f6',
        sections: ['personal', 'summary', 'experience', 'education', 'skills']
      },
      {
        id: 'professional-2',
        name: 'Executive',
        style: 'elegant',
        layout: 'vertical',
        accentColor: '#1e40af',
        sections: ['personal', 'summary', 'experience', 'education', 'skills', 'projects']
      }
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    category: 'Artistic & Bold',
    description: 'Visually striking designs for creative fields',
    color: 'bg-purple-500',
    templates: [
      {
        id: 'creative-1',
        name: 'Portfolio',
        style: 'modern',
        layout: 'horizontal',
        accentColor: '#8b5cf6',
        sections: ['personal', 'projects', 'skills', 'experience', 'education']
      },
      {
        id: 'creative-2',
        name: 'Designer',
        style: 'minimal',
        layout: 'vertical',
        accentColor: '#7c3aed',
        sections: ['personal', 'projects', 'skills', 'experience']
      }
    ]
  },
  {
    id: 'technical',
    name: 'Technical',
    category: 'Developer Focused',
    description: 'Optimized for tech roles and developer positions',
    color: 'bg-green-500',
    templates: [
      {
        id: 'technical-1',
        name: 'Developer',
        style: 'tech',
        layout: 'vertical',
        accentColor: '#10b981',
        sections: ['personal', 'skills', 'projects', 'experience', 'education']
      },
      {
        id: 'technical-2',
        name: 'Engineer',
        style: 'structured',
        layout: 'vertical',
        accentColor: '#059669',
        sections: ['personal', 'experience', 'projects', 'skills', 'education']
      }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimal',
    category: 'Simple & Elegant',
    description: 'Clean, minimal designs that focus on content',
    color: 'bg-gray-600',
    templates: [
      {
        id: 'minimal-1',
        name: 'Clean Simple',
        style: 'minimalist',
        layout: 'vertical',
        accentColor: '#6b7280',
        sections: ['personal', 'experience', 'education', 'skills']
      },
      {
        id: 'minimal-2',
        name: 'One Column',
        style: 'simple',
        layout: 'vertical',
        accentColor: '#4b5563',
        sections: ['personal', 'summary', 'experience', 'education', 'skills']
      }
    ]
  }
];

// Helper function to show SweetAlert with fallback
const showAlert = async (options) => {
  const Swal = await loadSweetAlert();
  if (Swal) {
    return Swal.fire(options);
  } else {
    // Fallback to native alerts
    if (options.icon === 'success') {
      alert(options.title + (options.text ? '\n' + options.text : ''));
      return { isConfirmed: true };
    } else if (options.icon === 'error') {
      alert('Error: ' + options.title + (options.text ? '\n' + options.text : ''));
      return { isConfirmed: true };
    } else if (options.icon === 'warning' || options.icon === 'question') {
      const confirmed = confirm(options.title + (options.text ? '\n' + options.text : ''));
      return { isConfirmed: confirmed };
    } else {
      alert(options.title + (options.text ? '\n' + options.text : ''));
      return { isConfirmed: true };
    }
  }
};

// Auth Component
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        await showAlert({
          icon: 'success',
          title: 'Signed in successfully!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        await showAlert({
          icon: 'success',
          title: 'Account created successfully!',
          text: 'Welcome to ResumeBuilder!',
          confirmButtonText: 'Get Started'
        });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*?\)/, ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await showAlert({
        icon: 'success',
        title: 'Signed in successfully!',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      await showAlert({
        icon: 'error',
        title: 'Sign-in Error',
        text: err.message.replace('Firebase: ', ''),
        confirmButtonText: 'OK'
      });
    }
  };

  const handleTabSwitch = (isLoginTab) => {
    setIsLogin(isLoginTab);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-3xl font-bold text-white">R</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ResumeBuilder</h1>
            <p className="text-gray-600">Create your professional resume in minutes</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                isLogin 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                !isLogin 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
          >
            <Icons.Google />
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Resume Builder Component
const ResumeBuilder = ({ user, onLogout }) => {
  const [resumeData, setResumeData] = useState({
    id: null,
    name: 'My Resume',
    personalInfo: {
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [previewMode, setPreviewMode] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadType, setDownloadType] = useState('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('professional-1');

  useEffect(() => {
    loadSavedResumes();
  }, [user]);

  const loadSavedResumes = async () => {
    try {
      const q = query(collection(db, 'resumes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const resumes = [];
      querySnapshot.forEach((doc) => {
        resumes.push({ id: doc.id, ...doc.data() });
      });
      setSavedResumes(resumes);
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      const resumeId = resumeData.id || `resume_${Date.now()}`;
      await setDoc(doc(db, 'resumes', resumeId), {
        ...resumeData,
        id: resumeId,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });
      setResumeData(prev => ({ ...prev, id: resumeId }));
      await loadSavedResumes();
      await showAlert({
        icon: 'success',
        title: 'Success!',
        text: 'Resume saved successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      await showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Error saving resume. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  const loadResume = async (resumeId) => {
    try {
      const docRef = doc(db, 'resumes', resumeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResumeData(docSnap.data());
        setShowSaveModal(false);
        await showAlert({
          icon: 'success',
          title: 'Resume Loaded!',
          text: 'Your resume has been loaded successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      await showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load resume. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  const deleteResume = async (resumeId) => {
    const result = await showAlert({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) return;
    
    try {
      await deleteDoc(doc(db, 'resumes', resumeId));
      await loadSavedResumes();
      if (resumeData.id === resumeId) {
        setResumeData({
          id: null,
          name: 'My Resume',
          personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '' },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          projects: []
        });
      }
      await showAlert({
        icon: 'success',
        title: 'Deleted!',
        text: 'Resume has been deleted.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      await showAlert({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete resume. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      showAlert({
        icon: 'success',
        title: 'Skill Added!',
        text: `"${skill}" has been added to your skills list.`,
        timer: 1000,
        showConfirmButton: false
      });
    }
  };

  const removeSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now(),
        name: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const downloadResume = async (type = 'print') => {
    try {
      const filename = `${resumeData.personalInfo.fullName || 'resume'}_${Date.now()}`;
      
      switch(type) {
        case 'print':
          await generatePDF('resume-preview', filename);
          await showAlert({
            icon: 'success',
            title: 'Print Ready!',
            text: 'Your resume is ready for printing.',
            timer: 1500,
            showConfirmButton: false
          });
          break;
          
        case 'doc':
          const resumeElement = document.getElementById('resume-preview');
          if (!resumeElement) {
            throw new Error('Resume element not found');
          }
          
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>${resumeData.personalInfo.fullName || 'Resume'}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 40px; 
                    line-height: 1.6;
                  }
                  h1 { 
                    color: #2c3e50; 
                    border-bottom: 3px solid #3b82f6;
                    padding-bottom: 10px;
                  }
                  h2 {
                    color: #374151;
                    border-bottom: 2px solid #d1d5db;
                    padding-bottom: 8px;
                    margin-top: 30px;
                  }
                  .section { 
                    margin-bottom: 25px; 
                  }
                  .contact-info {
                    margin-bottom: 20px;
                  }
                  .job-item, .education-item {
                    margin-bottom: 20px;
                  }
                  .skills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                  }
                  .skill-tag {
                    background-color: #e0e7ff;
                    color: #3730a3;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 14px;
                  }
                </style>
              </head>
              <body>
                <h1>${resumeData.personalInfo.fullName || 'Your Name'}</h1>
                
                <div class="contact-info">
                  ${resumeData.personalInfo.title ? `<p><strong>${resumeData.personalInfo.title}</strong></p>` : ''}
                  ${resumeData.personalInfo.email ? `<p>📧 ${resumeData.personalInfo.email}</p>` : ''}
                  ${resumeData.personalInfo.phone ? `<p>📱 ${resumeData.personalInfo.phone}</p>` : ''}
                  ${resumeData.personalInfo.location ? `<p>📍 ${resumeData.personalInfo.location}</p>` : ''}
                  ${resumeData.personalInfo.linkedin ? `<p>🔗 ${resumeData.personalInfo.linkedin}</p>` : ''}
                  ${resumeData.personalInfo.website ? `<p>🌐 ${resumeData.personalInfo.website}</p>` : ''}
                </div>
                
                ${resumeData.summary ? `
                  <div class="section">
                    <h2>Professional Summary</h2>
                    <p>${resumeData.summary}</p>
                  </div>
                ` : ''}
                
                ${resumeData.experience.length > 0 ? `
                  <div class="section">
                    <h2>Work Experience</h2>
                    ${resumeData.experience.map(exp => `
                      <div class="job-item">
                        <h3>${exp.position} at ${exp.company}</h3>
                        <p><em>${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}${exp.location ? ` | ${exp.location}` : ''}</em></p>
                        ${exp.description ? `<p>${exp.description.replace(/\n/g, '<br>')}</p>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${resumeData.education.length > 0 ? `
                  <div class="section">
                    <h2>Education</h2>
                    ${resumeData.education.map(edu => `
                      <div class="education-item">
                        <h3>${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
                        <p><strong>${edu.institution}</strong></p>
                        <p><em>${edu.startDate} - ${edu.endDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</em></p>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${resumeData.skills.length > 0 ? `
                  <div class="section">
                    <h2>Skills</h2>
                    <div class="skills">
                      ${resumeData.skills.map(skill => `
                        <span class="skill-tag">${skill}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${resumeData.projects.length > 0 ? `
                  <div class="section">
                    <h2>Projects</h2>
                    ${resumeData.projects.map(proj => `
                      <div class="job-item">
                        <h3>${proj.name}</h3>
                        ${proj.technologies ? `<p><strong>Technologies:</strong> ${proj.technologies}</p>` : ''}
                        ${proj.description ? `<p>${proj.description}</p>` : ''}
                        ${proj.link ? `<p><a href="${proj.link}">View Project</a></p>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </body>
            </html>
          `;
          
          const blob = new Blob([htmlContent], { type: 'application/msword' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.doc`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          await showAlert({
            icon: 'success',
            title: 'Download Started!',
            text: 'Your resume is downloading as a DOC file.',
            timer: 1500,
            showConfirmButton: false
          });
          break;
      }
      
      setShowDownloadOptions(false);
    } catch (error) {
      console.error('Download error:', error);
      await showAlert({
        icon: 'error',
        title: 'Download Error',
        text: 'Error downloading resume. Please try the print option.',
        confirmButtonText: 'OK'
      });
    }
  };

  const applyTemplate = (template) => {
    setActiveTemplate(template.id);
    showAlert({
      icon: 'success',
      title: 'Template Applied!',
      text: `"${template.name}" template has been applied successfully.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: Icons.User },
    { id: 'summary', name: 'Summary', icon: Icons.Sparkles },
    { id: 'experience', name: 'Experience', icon: Icons.Briefcase },
    { id: 'education', name: 'Education', icon: Icons.Education },
    { id: 'skills', name: 'Skills', icon: Icons.Code },
    { id: 'projects', name: 'Projects', icon: Icons.Award }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ResumeBuilder</h1>
                <p className="text-xs text-gray-500">{resumeData.name}</p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.Template />
                <span className="font-medium">Templates</span>
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.Save />
                <span className="font-medium">My Resumes</span>
              </button>
              <button
                onClick={saveResume}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Icons.Save />
                <span className="font-medium">{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Icons.Eye />
                <span className="font-medium">{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
              
              {/* Download Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Icons.Download />
                  <span className="font-medium">Download</span>
                </button>
                
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => downloadResume('print')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    >
                      <Icons.Download />
                      <span>Print/PDF</span>
                    </button>
                    <button
                      onClick={() => downloadResume('doc')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    >
                      <Icons.Save />
                      <span>Download as DOC</span>
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Icons.Logout />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => { setShowTemplates(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Template />
                <span>Templates</span>
              </button>
              <button
                onClick={() => { setShowSaveModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Save />
                <span>My Resumes</span>
              </button>
              <button
                onClick={() => { saveResume(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <Icons.Save />
                <span>Save Resume</span>
              </button>
              <button
                onClick={() => { setPreviewMode(!previewMode); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                <Icons.Eye />
                <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
              </button>
              <button
                onClick={() => { downloadResume('print'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                <Icons.Download />
                <span>Print/PDF</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Icons.Logout />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Sections</h3>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon />
                        <span>{section.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Editor Area */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Personal Info Section */}
                {activeSection === 'personal' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                      <p className="text-gray-600">Tell us about yourself</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Professional Title
                        </label>
                        <input
                          type="text"
                          value={resumeData.personalInfo.title}
                          onChange={(e) => updatePersonalInfo('title', e.target.value)}
                          placeholder="Software Engineer"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => updatePersonalInfo('email', e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                            placeholder="+1 234 567 8900"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Location
                        </label>
                          <input
                          type="text"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => updatePersonalInfo('location', e.target.value)}
                          placeholder="New York, NY"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                            placeholder="linkedin.com/in/johndoe"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={resumeData.personalInfo.website}
                            onChange={(e) => updatePersonalInfo('website', e.target.value)}
                            placeholder="johndoe.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                {activeSection === 'summary' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
                      <p className="text-gray-600">Write a brief overview of your professional background</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Summary
                      </label>
                      <textarea
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Experienced software engineer with 5+ years of expertise in full-stack development..."
                        rows="8"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Tip: Keep it concise (3-4 sentences) and highlight your key achievements
                      </p>
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                {activeSection === 'experience' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
                        <p className="text-gray-600">Add your work history</p>
                      </div>
                      <button
                        onClick={addExperience}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Icons.Plus />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {resumeData.experience.map((exp) => (
                        <div key={exp.id} className="relative bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icons.Trash />
                          </button>

                          <div className="space-y-4 pr-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Position *
                                </label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                  placeholder="Software Engineer"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Company *
                                </label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                  placeholder="Tech Company"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Location
                              </label>
                              <input
                                type="text"
                                value={exp.location}
                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                placeholder="San Francisco, CA"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Start Date
                                </label>
                                <input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  End Date
                                </label>
                                <input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  disabled={exp.current}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Currently working here</span>
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                placeholder="• Led development of key features&#10;• Collaborated with cross-functional teams&#10;• Improved performance by 40%"
                                rows="4"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {resumeData.experience.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Icons.Briefcase />
                          <p className="mt-2 text-gray-600">No experience added yet</p>
                          <p className="text-sm text-gray-500">Click "Add" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {activeSection === 'education' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
                        <p className="text-gray-600">Add your educational background</p>
                      </div>
                      <button
                        onClick={addEducation}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Icons.Plus />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {resumeData.education.map((edu) => (
                        <div key={edu.id} className="relative bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icons.Trash />
                          </button>

                          <div className="space-y-4 pr-12">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Institution *
                                </label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                  placeholder="University Name"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Degree *
                                </label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Field of Study
                                </label>
                                <input
                                  type="text"
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                  placeholder="Computer Science"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  GPA
                                </label>
                                <input
                                  type="text"
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                  placeholder="3.8/4.0"
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Start Date
                                </label>
                                <input
                                  type="month"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  End Date
                                </label>
                                <input
                                  type="month"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {resumeData.education.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Icons.Education />
                          <p className="mt-2 text-gray-600">No education added yet</p>
                          <p className="text-sm text-gray-500">Click "Add" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {activeSection === 'skills' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
                      <p className="text-gray-600">Add your technical and soft skills</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Add Skill
                      </label>
                      <input
                        type="text"
                        placeholder="Type a skill and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSkill(e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:text-indigo-900 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {resumeData.skills.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Icons.Code />
                        <p className="mt-2 text-gray-600">No skills added yet</p>
                        <p className="text-sm text-gray-500">Type a skill and press Enter</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Projects Section */}
                {activeSection === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
                        <p className="text-gray-600">Showcase your best work</p>
                      </div>
                      <button
                        onClick={addProject}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Icons.Plus />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {resumeData.projects.map((proj) => (
                        <div key={proj.id} className="relative bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <button
                            onClick={() => removeProject(proj.id)}
                            className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icons.Trash />
                          </button>

                          <div className="space-y-4 pr-12">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Project Name *
                              </label>
                                <input
                                type="text"
                                value={proj.name}
                                onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                                placeholder="E-Commerce Platform"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Technologies
                              </label>
                              <input
                                type="text"
                                value={proj.technologies}
                                onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                                placeholder="React, Node.js, MongoDB"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                value={proj.description}
                                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                                placeholder="Built a full-stack e-commerce platform with features like..."
                                rows="3"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Project Link
                              </label>
                              <input
                                type="url"
                                value={proj.link}
                                onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                placeholder="https://github.com/username/project"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {resumeData.projects.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <Icons.Award />
                          <p className="mt-2 text-gray-600">No projects added yet</p>
                          <p className="text-sm text-gray-500">Click "Add" to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3">
                    <h3 className="text-white font-semibold">Live Preview</h3>
                  </div>
                  <div className="p-4 bg-gray-100 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="scale-75 origin-top">
                      <ResumePreview data={resumeData} template={activeTemplate} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto" id="resume-preview">
            <ResumePreview data={resumeData} template={activeTemplate} />
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Resumes</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Resume Name
                </label>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => setResumeData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={saveResume}
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Resume'}
                </button>
                <button
                  onClick={async () => {
                    const result = await showAlert({
                      title: 'Start New Resume?',
                      text: 'This will clear your current resume. Make sure to save first!',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#10b981',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: 'Yes, start new',
                      cancelButtonText: 'Cancel'
                    });
                    
                    if (result.isConfirmed) {
                      setResumeData({
                        id: null,
                        name: 'My Resume',
                        personalInfo: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '' },
                        summary: '',
                        experience: [],
                        education: [],
                        skills: [],
                        projects: []
                      });
                      setShowSaveModal(false);
                      showAlert({
                        icon: 'success',
                        title: 'New Resume Started!',
                        text: 'You can now create a new resume.',
                        timer: 1500,
                        showConfirmButton: false
                      });
                    }
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  New Resume
                </button>
                <button
                  onClick={() => {
                    setShowTemplates(true);
                    setShowSaveModal(false);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Icons.Template />
                  <span>Templates</span>
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Saved Resumes ({savedResumes.length})
                </h3>
                {savedResumes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-600">No saved resumes yet</p>
                    <p className="text-sm text-gray-500 mt-1">Save your first resume to see it here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          resumeData.id === resume.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">{resume.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">
                          Last updated: {resume.updatedAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadResume(resume.id)}
                            className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteResume(resume.id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Resume Templates</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {resumeTemplates.map((category) => (
                  <div
                    key={category.id}
                    className={`${category.color} text-white rounded-xl p-6 shadow-lg`}
                  >
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90 mb-4">{category.category}</p>
                    <p className="text-sm opacity-80">{category.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                {resumeTemplates.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                      {category.name} Templates
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.templates.map((template) => (
                        <div
                          key={template.id}
                          className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                            activeTemplate === template.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => applyTemplate(template)}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                              {template.style}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">Layout:</span>
                              <span>{template.layout}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">Sections:</span>
                              <span>{template.sections.join(', ')}</span>
                            </div>
                          </div>
                          <button
                            className={`mt-4 w-full py-2 rounded-lg font-medium ${
                              activeTemplate === template.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {activeTemplate === template.id ? 'Selected' : 'Use Template'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Resume Preview Component
const ResumePreview = ({ data, template }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto resume-preview">
      {/* Header */}
      <div className="border-b-4 border-indigo-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName || 'Your Name'}
        </h1>
        {data.personalInfo.title && (
          <p className="text-xl text-indigo-600 font-semibold mb-3">
            {data.personalInfo.title}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
          {data.personalInfo.email && <span>📧 {data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>📱 {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>📍 {data.personalInfo.location}</span>}
        </div>
        {(data.personalInfo.linkedin || data.personalInfo.website) && (
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            {data.personalInfo.linkedin && (
              <a href={data.personalInfo.linkedin} className="text-indigo-600 hover:underline">
                🔗 LinkedIn
              </a>
            )}
            {data.personalInfo.website && (
              <a href={data.personalInfo.website} className="text-indigo-600 hover:underline">
                🌐 Website
              </a>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
            Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-indigo-600 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700 font-semibold">{exp.company}</p>
                    {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {data.projects.map((proj) => (
              <div key={proj.id} className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{proj.name}</h3>
                {proj.technologies && (
                  <p className="text-sm text-purple-600 font-semibold mb-2">{proj.technologies}</p>
                )}
                {proj.description && (
                  <p className="text-gray-700 leading-relaxed mb-2">{proj.description}</p>
                )}
                {proj.link && (
                  <a href={proj.link} className="text-indigo-600 hover:underline text-sm">
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-green-600 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-gray-700 font-semibold">{edu.institution}</p>
                    {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const Swal = await loadSweetAlert();
      
      let result;
      if (Swal) {
        result = await Swal.fire({
          title: 'Logout?',
          text: 'Are you sure you want to logout?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Yes, logout',
          cancelButtonText: 'Cancel'
        });
      } else {
        // Fallback to native confirm
        const confirmed = window.confirm('Are you sure you want to logout?');
        result = { isConfirmed: confirmed };
      }

      if (result.isConfirmed) {
        await signOut(auth);
        // No need to show success message - the auth state change will handle redirect
      }
    } catch (error) {
      console.error('Logout error:', error);
      const Swal = await loadSweetAlert();
      if (Swal) {
        Swal.fire({
          icon: 'error',
          title: 'Logout Error',
          text: 'Failed to logout. Please try again.',
          confirmButtonText: 'OK'
        });
      } else {
        alert('Failed to logout: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-preview, .resume-preview * {
            visibility: visible;
          }
          .resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none;
          }
          @page {
            margin: 20mm;
          }
          a {
            text-decoration: none;
            color: inherit;
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      <div className="min-h-screen">
        {user ? (
          <ResumeBuilder user={user} onLogout={handleLogout} />
        ) : (
          <AuthScreen />
        )}
      </div>
    </>
  );
}