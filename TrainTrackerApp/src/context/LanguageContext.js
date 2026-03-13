import React, { createContext, useContext, useState } from 'react';

export const LANGUAGES = {
    fr: { label: 'FR', flag: '🇫🇷', dir: 'ltr' },
    en: { label: 'EN', flag: '🇬🇧', dir: 'ltr' },
    ar: { label: 'AR', flag: '🇹🇳', dir: 'rtl' },
};

export const translations = {
    fr: {
        // Home
        appTitle: 'Banlieue Sud Tracker',
        appSubtitle: 'SNCFT Réseau Express',
        homeDescription: 'Suivez la position des trains de la Banlieue Sud de Tunis en temps réel.',
        seeTrains: 'Voir les trains',
        developedBy: 'Développé par',
        supervisorLabel: 'Encadreur : Hassen Soyed (Directeur de mouvement)',
        pfeLabel: 'Projet PFE - 2026',
        // Menu
        lostFound: 'Objets Trouvés',
        reclamations: 'Réclamations',
        schedule: 'Horaires',
        learnMore: 'En savoir plus',
        adminDashboard: 'Tableau de bord Admin',
        logout: 'Se Déconnecter',
        // Map
        selectDeparture: 'Sélectionner départ',
        selectArrival: 'Sélectionner arrivée',
        chooseStation: 'Choisir une gare',
        departure: 'Départ',
        arrival: 'Arrivée',
        distance: 'Distance',
        duration: 'Durée',
        km: 'km',
        min: 'min',
        trainArrives: 'Le train arrive dans',
        arrived: 'Arrivé',
        noTrain: 'Aucun train en mouvement',
        trainAt: 'Train à',
        // Schedule
        scheduleTitle: 'Horaires Banlieue Sud',
        scheduleSubtitle: 'SNCFT · Ramadan 2026',
        towardsBorj: 'Tunis → Borj Cédria',
        towardsTunis: 'Borj Cédria → Tunis',
        back: '← Retour',
        // Lost and Found
        lostFoundTitle: 'Objets Trouvés',
        // Reclamations
        reclamationsTitle: 'Réclamations',
        // Learn More
        learnMoreTitle: 'À propos de l\'application',
        // Auth
        login: 'Se connecter',
        register: "S'inscrire",
        email: 'E-mail',
        password: 'Mot de passe',
        name: 'Nom',
        confirmPassword: 'Confirmer le mot de passe',
        alreadyAccount: 'Déjà un compte ?',
        noAccount: 'Pas encore de compte ?',
    },

    en: {
        // Home
        appTitle: 'Southern Suburbs Tracker',
        appSubtitle: 'SNCFT Express Network',
        homeDescription: 'Track Tunis Southern Suburbs trains in real time.',
        seeTrains: 'See trains',
        developedBy: 'Developed by',
        supervisorLabel: 'Supervisor: Hassen Soyed (Movement Director)',
        pfeLabel: 'PFE Project - 2026',
        // Menu
        lostFound: 'Lost & Found',
        reclamations: 'Complaints',
        schedule: 'Schedule',
        learnMore: 'Learn more',
        adminDashboard: 'Admin Dashboard',
        logout: 'Log out',
        // Map
        selectDeparture: 'Select departure',
        selectArrival: 'Select arrival',
        chooseStation: 'Choose a station',
        departure: 'Departure',
        arrival: 'Arrival',
        distance: 'Distance',
        duration: 'Duration',
        km: 'km',
        min: 'min',
        trainArrives: 'Train arrives in',
        arrived: 'Arrived',
        noTrain: 'No active train',
        trainAt: 'Train at',
        // Schedule
        scheduleTitle: 'Southern Suburbs Schedule',
        scheduleSubtitle: 'SNCFT · Ramadan 2026',
        towardsBorj: 'Tunis → Borj Cédria',
        towardsTunis: 'Borj Cédria → Tunis',
        back: '← Back',
        // Lost and Found
        lostFoundTitle: 'Lost & Found',
        // Reclamations
        reclamationsTitle: 'Complaints',
        // Learn More
        learnMoreTitle: 'About the App',
        // Auth
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        name: 'Name',
        confirmPassword: 'Confirm password',
        alreadyAccount: 'Already have an account?',
        noAccount: 'No account yet?',
    },

    ar: {
        // Home
        appTitle: 'متتبع الضاحية الجنوبية',
        appSubtitle: 'الشبكة السريعة SNCFT',
        homeDescription: 'تابع مواقع قطارات الضاحية الجنوبية لتونس في الوقت الفعلي.',
        seeTrains: 'مشاهدة القطارات',
        developedBy: 'تطوير',
        supervisorLabel: 'المشرف: حسن سويد (مدير الحركة)',
        pfeLabel: 'مشروع التخرج - 2026',
        // Menu
        lostFound: 'المفقودات والموجودات',
        reclamations: 'الشكاوى',
        schedule: 'جدول المواعيد',
        learnMore: 'معرفة المزيد',
        adminDashboard: 'لوحة التحكم',
        logout: 'تسجيل الخروج',
        // Map
        selectDeparture: 'اختر نقطة الانطلاق',
        selectArrival: 'اختر نقطة الوصول',
        chooseStation: 'اختر محطة',
        departure: 'الانطلاق',
        arrival: 'الوصول',
        distance: 'المسافة',
        duration: 'المدة',
        km: 'كم',
        min: 'د',
        trainArrives: 'القطار يصل في',
        arrived: 'وصل',
        noTrain: 'لا يوجد قطار نشط',
        trainAt: 'القطار في',
        // Schedule
        scheduleTitle: 'مواعيد الضاحية الجنوبية',
        scheduleSubtitle: 'SNCFT · رمضان 2026',
        towardsBorj: 'تونس ← برج السدرية',
        towardsTunis: 'برج السدرية ← تونس',
        back: 'رجوع →',
        // Lost and Found
        lostFoundTitle: 'المفقودات والموجودات',
        // Reclamations
        reclamationsTitle: 'الشكاوى',
        // Learn More
        learnMoreTitle: 'حول التطبيق',
        // Auth
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        name: 'الاسم',
        confirmPassword: 'تأكيد كلمة المرور',
        alreadyAccount: 'لديك حساب بالفعل؟',
        noAccount: 'لا تملك حساباً؟',
    },
};

export const LanguageContext = createContext({
    lang: 'fr',
    setLang: () => {},
    t: (key) => key,
    isRTL: false,
});

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('fr');

    const t = (key) => translations[lang]?.[key] ?? translations['fr']?.[key] ?? key;
    const isRTL = LANGUAGES[lang]?.dir === 'rtl';

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
