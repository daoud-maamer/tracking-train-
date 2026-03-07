import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';

// ─────────────────────────────────────────────
//  KNOWLEDGE BASE  (30+ categories, FR + AR + EN)
// ─────────────────────────────────────────────
const KB = [
    {
        id: 'greeting',
        keywords: ['bonjour', 'salut', 'hello', 'hi', 'coucou', 'bjr', 'slt', 'bonsoir', 'bsr', 'ahlan', 'marhaba'],
        response: "Bonjour! 👋 Je suis l'assistant virtuel de la SNCFT. Je peux vous aider avec:\n• 🕐 Horaires des trains\n• 💰 Tarifs & billets\n• 🗺️ Stations & lignes\n• 📦 Bagages & animaux\n• 🔍 Objets perdus\n• 🛡️ Sécurité & urgences\n• 📋 Réclamations\n• 📞 Contact\n\nComment puis-je vous aider?"
    },
    {
        id: 'thanks',
        keywords: ['merci', 'thanks', 'thank you', 'thx', 'choukran', 'شكرا'],
        response: "De rien! 😊 Je suis là pour vous aider. Avez-vous d'autres questions?"
    },
    {
        id: 'bye',
        keywords: ['au revoir', 'bye', 'bonne journée', 'à bientôt', 'ciao', 'good bye'],
        response: "Au revoir! 🚂 Bon voyage avec la SNCFT. N'hésitez pas à me contacter à tout moment!"
    },
    {
        id: 'horaires',
        keywords: ['horaire', 'heure', 'quand', 'prochain train', 'départ', 'arrivée', 'schedule', 'time', 'départs', 'passage'],
        response: "🕐 Horaires banlieue sud (jours ouvrables):\n\n🔵 Tunis Ville → Radès:\n5:10 · 5:30 · 5:40 · 6:05 · 6:20 · 6:40 · 7:00 · 7:20 · 7:50 · 8:20 · puis toutes les 30–40 min jusqu'à 22:00\n\n🔴 Radès → Tunis Ville:\n5:24 · 5:44 · 5:54 · 6:20 · 6:34 · 6:55 · 7:14 · 7:34 · 8:05 · puis toutes les 30–40 min jusqu'à 22:15\n\n📱 Consultez l'onglet 'Horaires' de l'app pour les horaires en temps réel."
    },
    {
        id: 'tarif',
        keywords: ['prix', 'tarif', 'billet', 'combien', 'coût', 'price', 'cost', 'ticket', 'payer', 'paiement', 'argent'],
        response: "💰 Tarifs banlieue sud:\n\n• Tunis ↔ Mégrine: 0.800 DT\n• Tunis ↔ Foch: 1.000 DT\n• Tunis ↔ Radès: 1.200 DT\n• Tunis ↔ Bir Bou Regba: 2.000 DT\n\n🎫 Forfaits:\n• Carte 10 voyages: 10 DT (valable 3 mois)\n• Abonnement mensuel: 35 DT\n• Abonnement étudiant: 18 DT (-50%)\n• Abonnement senior (+60 ans): 17.5 DT\n\n💡 Achat aux guichets ou via l'application."
    },
    {
        id: 'stations',
        keywords: ['station', 'gare', 'arrêt', 'où', 'stops', 'ligne', 'liste', 'trajets', 'destinations'],
        response: "🗺️ Stations de la banlieue sud (de Tunis):\n\n1️⃣ Tunis Ville (terminus Nord)\n2️⃣ Tunis Marine\n3️⃣ Ibn Khaldoun\n4️⃣ République\n5️⃣ Bab Jedid\n6️⃣ Ez-Zahra\n7️⃣ Mégrine\n8️⃣ Mégrine Erriadh\n9️⃣ Foch\n🔟 Es-Séjoumi\n1️⃣1️⃣ Bir El Kassaa\n1️⃣2️⃣ Borj El Amri\n1️⃣3️⃣ Radès (terminus Sud)"
    },
    {
        id: 'retard',
        keywords: ['retard', 'delay', 'tard', 'en retard', 'attendre', 'late', 'annulé', 'annulation', 'supprimé', 'pas de train'],
        response: "⏰ En cas de retard ou annulation:\n\n1. Vérifiez les annonces en gare\n2. Consultez le tableau d'affichage en temps réel\n3. Contactez le service client:\n   📞 71 345 000\n   📧 client@sncft.com.tn\n\n💡 En cas d'annulation, un remboursement total est effectué sur présentation du billet dans les 24h."
    },
    {
        id: 'bagages',
        keywords: ['bagage', 'valise', 'sac', 'baggage', 'luggage', 'transport bagage', 'colis', 'chariot'],
        response: "🧳 Règles bagages:\n\n✅ Autorisé gratuitement:\n• 2 bagages/personne\n• Poids max: 30 kg/bagage\n• Dimensions max: 70 × 50 × 30 cm\n\n💵 Bagages supplémentaires:\n• 3 DT/pièce (payable au guichet)\n\n⛔ Interdits:\n• Matières dangereuses / inflammables\n• Objets tranchants non emballés"
    },
    {
        id: 'animaux',
        keywords: ['animal', 'chien', 'chat', 'pet', 'dog', 'cat', 'bête', 'animaux', 'lapin'],
        response: "🐾 Transport d'animaux:\n\n🆓 Gratuit:\n• Petits animaux en cage ou sac fermé\n• Cage max: 45 × 30 × 30 cm\n\n💵 Payant (1 DT):\n• Chien tenu en laisse + muselière obligatoire\n\n⛔ Interdits:\n• Animaux sauvages ou dangereux\n• Animaux sans muselière (> petite taille)\n\n⚠️ L'animal doit rester avec son propriétaire."
    },
    {
        id: 'abonnement',
        keywords: ['abonnement', 'mensuel', 'hebdomadaire', 'subscription', 'renouvellement', 'carte', 'étudiant', 'senior', 'retraite'],
        response: "🎫 Abonnements disponibles:\n\n• Mensuel standard: 35 DT / 30 jours\n• Étudiant: 18 DT (carte d'étudiant obligatoire)\n• Senior +60 ans: 17.5 DT\n• Carte 10 voyages: 10 DT / 3 mois\n\n📍 Renouvellement:\n• Aux guichets de toutes les gares\n• En ligne sur sncft.com.tn\n• Via l'application SNCFT\n\n💡 Le renouvellement est possible 5 jours avant l'expiration."
    },
    {
        id: 'perdu',
        keywords: ['perdu', 'objet perdu', 'trouvé', 'lost', 'found', 'oublié', 'laissé dans le train', 'récupérer', 'cherche'],
        response: "🔍 Objets perdus:\n\n1. Contactez le bureau des objets trouvés:\n   📞 71 345 111\n   📧 objets@sncft.com.tn\n\n2. Décrivez précisément:\n   • L'objet (couleur, taille, marque)\n   • Date et heure du trajet\n   • Numéro du train / wagon\n\n3. Pièce d'identité requise pour récupérer\n\n⚠️ Les objets sont conservés 30 jours maximum.\n\n💡 Utilisez aussi l'onglet 'Objets Perdus' de l'app!"
    },
    {
        id: 'securite',
        keywords: ['sécurité', 'danger', 'urgence', 'emergency', 'police', 'agression', 'vol', 'accident', 'blessé', 'secours', 'sos', 'incendie'],
        response: "🛡️ Numéros d'urgence:\n\n🚨 Police SNCFT: 71 345 222\n🚑 SAMU / Urgences médicales: 190\n🔥 Pompiers: 198\n🚓 Police nationale: 197\n\n🔴 Dans le train:\n• Utilisez le bouton d'arrêt d'urgence (rouge) dans chaque wagon\n• Prévenez immédiatement le contrôleur\n• Signalez tout comportement suspect\n\n⚠️ N'actionnez le bouton d'arrêt qu'en cas de véritable danger."
    },
    {
        id: 'reclamation',
        keywords: ['réclamation', 'plainte', 'problème', 'complaint', 'insatisfait', 'mauvais service', 'signaler', 'déposer'],
        response: "📋 Déposer une réclamation:\n\n📧 Email: reclamation@sncft.com.tn\n🌐 Formulaire: sncft.com.tn/reclamations\n📖 Livre de réclamation dans toutes les gares\n📞 Service réclamations: 71 345 003\n\n✍️ Indiquez obligatoirement:\n• Date et heure du trajet\n• Numéro du train / ligne\n• Nature du problème\n• Vos coordonnées\n\n⏱️ Délai de réponse: 48h ouvrées\n✅ Suivi par email après dépôt"
    },
    {
        id: 'contact',
        keywords: ['contact', 'appeler', 'téléphone', 'joindre', 'phone', 'whatsapp', 'email', 'adresse', 'site web'],
        response: "📞 Nous contacter:\n\n• Standard: 71 345 000\n• Service client: 71 345 001\n• Réclamations: 71 345 003\n• Objets trouvés: 71 345 111\n\n📧 Emails:\n• contact@sncft.com.tn\n• client@sncft.com.tn\n\n💬 WhatsApp: +216 50 123 456\n🌐 sncft.com.tn\n\n⏰ Horaires:\n• Lun–Ven: 7h00–20h00\n• Samedi: 8h00–14h00"
    },
    {
        id: 'accessibilite',
        keywords: ['handicap', 'fauteuil roulant', 'pmr', 'mobilité réduite', 'personnes handicapées', 'accessible', 'ascenseur'],
        response: "♿ Accessibilité & PMR:\n\n✅ Services disponibles:\n• Rampes d'accès dans les gares principales\n• Wagons réservés PMR en tête de train\n• Accompagnement par le personnel sur demande\n• Tarif réduit: -50% sur justificatif\n\n📞 Assistance PMR (48h à l'avance):\n71 345 005\n\n⚠️ Prévenez 24h à l'avance pour garantir l'assistance."
    },
    {
        id: 'wifi_climatisation',
        keywords: ['wifi', 'internet', 'climatisation', 'clim', 'chaud', 'froid', 'prises', 'recharge', 'confort'],
        response: "🛜 Confort à bord:\n\n• Climatisation: ✅ Disponible dans tous les trains récents\n• WiFi: ⚠️ En cours de déploiement (disponible sur certaines lignes)\n• Prises électriques: ⚠️ Disponibles dans wagons 1ère classe\n• Toilettes: ✅ Disponibles dans les trains longue distance\n\n💡 Pour les trajets banlieue sud, les wagons sont climatisés en été."
    },
    {
        id: 'retard_remboursement',
        keywords: ['remboursement', 'rembourser', 'remboursé', 'refund', 'annulé', 'retard important'],
        response: "💳 Remboursement:\n\n✅ Remboursement total si:\n• Train annulé par la SNCFT\n• Retard > 60 minutes\n\n📍 Comment:\n• Présentez votre billet non utilisé au guichet dans les 24h\n• Remboursement en espèces ou sur carte\n\n📧 reclamation@sncft.com.tn\n📞 71 345 003\n\n⚠️ Les billets déjà validés en cas de retard court ne sont pas remboursables."
    },
    {
        id: 'premiere_classe',
        keywords: ['1ère classe', 'première classe', 'first class', 'classe', 'confort', 'siège', 'place'],
        response: "💺 Classes disponibles:\n\n🔵 2ème classe (standard):\n• Sièges classiques\n• Climatisation\n• Disponible sur tous les trains\n\n🥇 1ère classe (sur certains trains):\n• Sièges plus larges\n• Prises électriques\n• Espace réservé\n• Supplément: +50% du tarif normal\n\n💡 Réservation en 1ère classe recommandée pour les longues distances."
    },
    {
        id: 'groupe',
        keywords: ['groupe', 'famille', 'scolaire', 'réduction groupe', 'enfant', 'enfants', 'bébé', 'nourrisson'],
        response: "👨‍👩‍👧‍👦 Tarifs spéciaux:\n\n👶 Enfants:\n• -4 ans: Gratuit (sur genoux)\n• 4–10 ans: -50%\n\n👫 Groupes (10+ personnes):\n• -30% sur le tarif normal\n• Réservation obligatoire 48h à l'avance\n\n🏫 Groupes scolaires:\n• Tarif spécial, contactez le service réservation:\n  📞 71 345 002"
    },
    {
        id: 'ponctualite',
        keywords: ['ponctuel', 'pris en charge', 'responsable', 'fiabilité', 'fréquence', 'souvent', 'régulièrement'],
        response: "⏱️ Ponctualité & Fréquence:\n\n• La SNCFT assure ~95% de ponctualité sur la banlieue sud\n• Fréquence: toutes les 20–40 min aux heures de pointe\n• Application de pénalités en cas de retard systématique\n\n📊 Consultez le tableau de ponctualité en temps réel sur sncft.com.tn"
    },
    {
        id: 'nuit',
        keywords: ['nuit', 'nuitée', 'dernier train', 'minuit', 'late night', 'soir', 'après 20h'],
        response: "🌙 Trains de nuit:\n\n• Dernier départ Tunis → Radès: 21:55\n• Dernier départ Radès → Tunis: 22:15\n\n⚠️ Pas de service entre 22h30 et 5h00.\n\n🚕 Alternatives nocturnes:\n• Taxi collectif depuis Tunis Ville\n• Application Bolt / InDrive disponibles"
    },
    {
        id: 'weekend',
        keywords: ['weekend', 'samedi', 'dimanche', 'week-end', 'férie', 'fériés', 'ramadan'],
        response: "📅 Horaires week-end & jours fériés:\n\n• Samedi: Service réduit (~70% des trains)\n  Fréquence: toutes les 40–60 min\n• Dimanche: Service minimum\n  Fréquence: toutes les 60 min\n• Jours fériés: horaires similaires au dimanche\n\n⚠️ Pendant le Ramadan: les horaires sont ajustés. Consultez l'onglet 'Horaires' de l'application."
    },
    {
        id: 'acheter_billet',
        keywords: ['acheter', 'où acheter', 'guichet', 'distributeur', 'acheter en ligne', 'réserver', 'commander'],
        response: "🎫 Où acheter votre billet:\n\n🏪 En gare:\n• Aux guichets (acceptent espèces + CB)\n• Distributeurs automatiques dans les grandes gares\n• Contrôleur à bord (+0.5 DT de frais)\n\n📱 En ligne:\n• Application SNCFT\n• Site web: sncft.com.tn\n\n⚠️ Montez toujours avec un billet validé pour éviter une amende."
    },
    {
        id: 'amende',
        keywords: ['amende', 'pénalité', 'sans billet', 'contrôle', 'contrôleur', 'frauder', 'fraude'],
        response: "⚠️ Voyager sans titre de transport:\n\n• 1ère infraction: Amende de 20 DT + prix du billet\n• Récidive: Amende de 50 DT + signalement\n• En cas de refus de paiement: procès-verbal transmis au tribunal\n\n💡 Conseil: Achetez toujours votre billet avant de monter à bord. C'est moins cher et évite les ennuis!"
    },
    {
        id: 'navette_aeroport',
        keywords: ['aéroport', 'tunis carthage', 'navette', 'airport', 'TUN'],
        response: "✈️ Aéroport Tunis-Carthage:\n\n🚇 Par train + métro léger:\n1. Train jusqu'à Tunis Ville\n2. Métro ligne 4 → Aéroport\n   (toutes les 15 min, ~20 min de trajet)\n\n🏷️ Tarif métro aéroport: 1 DT\n\n🕐 Disponible: 6h00–22h00\n\n💡 Alternative: Bus TCV nº35 depuis Tunis Ville"
    },
    {
        id: 'connexion_metro',
        keywords: ['métro léger', 'metro', 'correspondance', 'bus', 'tramway', 'intermodalité', 'changer', 'interconnexion'],
        response: "🔄 Correspondances à Tunis Ville:\n\n🚇 Métro léger (Transtu):\n• Lignes 1-2-3-4 depuis la gare centrale\n• Vers aéroport, banlieue nord, Ariana\n\n🚌 Bus (TCV / Transtu):\n• Plusieurs lignes desservent la gare\n• Ticket: 0.800 DT\n\n🏃 À pied:\n• Centre-ville, Médina: ~10 min à pied\n\n💡 Titres de transport non interchangeables entre SNCFT et Transtu."
    },
    {
        id: 'wifi_app',
        keywords: ['application', 'app', 'télécharger', 'appli', 'smartphone', 'download', 'google play', 'app store'],
        response: "📱 Application SNCFT:\n\n✅ Fonctionnalités:\n• Horaires en temps réel\n• Suivi des trains en direct\n• Achat et réservation de billets\n• Objets perdus & trouvés\n• Réclamations en ligne\n\n🔗 Téléchargement:\n• Google Play: recherchez 'SNCFT'\n• App Store: recherchez 'SNCFT'\n• sncft.com.tn/app"
    },
    {
        id: 'travaux',
        keywords: ['travaux', 'perturbation', 'voie fermée', 'déviation', 'interruption', 'maintenance'],
        response: "🔧 Travaux & Perturbations:\n\n• Les travaux nocturnes (23h–5h) sont affichés en gare\n• En cas de perturbation, des bus de substitution sont mis en place\n• Informations en temps réel sur:\n  📱 Application SNCFT\n  📻 Radio nationale\n  🌐 sncft.com.tn\n\n📞 Pour toute urgence: 71 345 000"
    },
    {
        id: 'fumeur',
        keywords: ['fumer', 'cigarette', 'tabac', 'fumeur', 'smoke', 'vaper'],
        response: "🚭 Interdiction de fumer:\n\n• Il est strictement interdit de fumer dans tous les trains et gares SNCFT\n• Cette règle s'applique également aux cigarettes électroniques\n• Amende: 30 DT en cas d'infraction\n\n💡 Des zones fumeurs sont parfois disponibles à l'extérieur des gares."
    },
    {
        id: 'aide',
        keywords: ['aide', 'help', 'options', 'menu', 'que peux-tu faire', 'quoi', 'sujets'],
        response: "🤖 Je peux vous aider sur ces sujets:\n\n🕐 Horaires & Stations\n💰 Tarifs & Billets\n🎫 Abonnements & Cartes\n⏰ Retards & Annulations\n💳 Remboursements\n🧳 Bagages & Animaux\n🔍 Objets perdus\n♿ Accessibilité PMR\n🛡️ Sécurité & Urgences\n📋 Réclamations\n📱 Application SNCFT\n📞 Contact\n✈️ Connexions & Aéroport\n\nÉcrivez simplement votre question en français, arabe ou anglais!"
    }
];

// ─────────────────────────────────────────────
//  SMART MATCHING ENGINE
//  Scores each KB entry and picks the best match
// ─────────────────────────────────────────────
const findBestResponse = (input, conversationContext) => {
    const lc = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Exact context follow-ups
    if (conversationContext.lastTopic) {
        const follow = {
            'horaires': ['oui', 'plus', 'détail', 'voir', 'complet', 'tout', 'afficher'],
            'tarif': ['payer', 'comment', 'où', 'accepter', 'carte', 'espèces'],
            'retard': ['comment', 'que faire', 'que', 'recours', 'rembours'],
        };
        const triggers = follow[conversationContext.lastTopic] || [];
        if (triggers.some(t => lc.includes(t))) {
            const topic = KB.find(e => e.id === conversationContext.lastTopic);
            if (topic) return { response: topic.response + '\n\n💬 Autre question?', topic: topic.id };
        }
    }

    // Score each entry
    let best = null;
    let bestScore = 0;

    for (const entry of KB) {
        let score = 0;
        for (const kw of entry.keywords) {
            const norm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (lc === norm) { score += 10; continue; }
            if (lc.includes(norm)) { score += norm.split(' ').length * 3; continue; }
            // partial word match
            const words = norm.split(' ');
            for (const w of words) {
                if (w.length > 3 && lc.includes(w)) score += 1;
            }
        }
        if (score > bestScore) { bestScore = score; best = entry; }
    }

    if (bestScore > 0 && best) {
        return { response: best.response, topic: best.id };
    }

    return {
        response: "🤔 Je n'ai pas bien compris votre question. Voici ce que je peux faire:\n\n• Tapez 'aide' pour voir tous les sujets\n• Tapez 'contact' pour parler à un agent humain\n\nExemples de questions:\n• \"Quels sont les horaires du matin?\"\n• \"Combien coûte un abonnement?\"\n• \"J'ai perdu mon sac\"\n• \"Comment déposer une réclamation?\"",
        topic: null
    };
};

// ─────────────────────────────────────────────
//  QUICK REPLY CHIPS
// ─────────────────────────────────────────────
const QUICK_REPLIES = [
    { label: '🕐 Horaires', text: 'Quels sont les horaires des trains?' },
    { label: '💰 Tarifs', text: 'Combien coûte un billet?' },
    { label: '🎫 Abonnement', text: 'Quels abonnements existe-t-il?' },
    { label: '⏰ Retard', text: 'Mon train est en retard' },
    { label: '🔍 Objet perdu', text: "J'ai perdu un objet dans le train" },
    { label: '📋 Réclamation', text: 'Je veux déposer une réclamation' },
    { label: '📞 Contact', text: 'Comment contacter le service client?' },
    { label: '♿ PMR', text: 'Services pour personnes handicapées' },
    { label: '✈️ Aéroport', text: "Comment aller à l'aéroport?" },
    { label: '🤖 Aide', text: 'aide' },
];

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
const ReclamationsScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Bonjour! 👋 Je suis l'assistant virtuel de la SNCFT.\n\nJe réponds instantanément à toutes vos questions sur les horaires, tarifs, abonnements, retards, objets perdus, réclamations et plus encore!\n\nComment puis-je vous aider?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState({ lastTopic: null });
    const scrollViewRef = useRef();

    const addBotMessage = useCallback((text) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text,
            sender: 'bot',
            timestamp: new Date()
        }]);
    }, []);

    const handleSend = useCallback((overrideText) => {
        const text = (overrideText || inputText).trim();
        if (!text) return;

        const userMessage = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        if (!overrideText) setInputText('');
        setIsTyping(true);

        const delay = 600 + Math.min(text.length * 8, 900); // realistic typing delay
        setTimeout(() => {
            const { response, topic } = findBestResponse(text, context);
            setContext({ lastTopic: topic });
            addBotMessage(response);
            setIsTyping(false);
        }, delay);
    }, [inputText, context, addBotMessage]);

    const handleQuickReply = (text) => handleSend(text);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isTyping]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.backButton}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Assistant SNCFT</Text>
                        <Text style={styles.headerSubtitle}>Service Client • 24/7</Text>
                    </View>
                    <View style={styles.onlineIndicator}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>En ligne</Text>
                    </View>
                </View>

                {/* Chat Messages */}
                <ScrollView
                    style={styles.chatContainer}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            style={[
                                styles.messageWrapper,
                                message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
                            ]}
                        >
                            {message.sender === 'bot' && (
                                <View style={styles.botAvatar}>
                                    <Text style={styles.botAvatarText}>🚂</Text>
                                </View>
                            )}
                            <View style={[
                                styles.messageBubble,
                                message.sender === 'user' ? styles.userBubble : styles.botBubble
                            ]}>
                                <Text style={[
                                    styles.messageText,
                                    message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                                ]}>
                                    {message.text}
                                </Text>
                                <Text style={styles.timestamp}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {isTyping && (
                        <View style={styles.messageWrapper}>
                            <View style={styles.botAvatar}>
                                <Text style={styles.botAvatarText}>🚂</Text>
                            </View>
                            <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                                <ActivityIndicator size="small" color="#1E3A8A" />
                                <Text style={styles.typingText}> en train d'écrire...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Quick Replies */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.quickRepliesContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {QUICK_REPLIES.map((qr) => (
                        <TouchableOpacity
                            key={qr.label}
                            style={styles.quickReplyChip}
                            onPress={() => handleQuickReply(qr.text)}
                        >
                            <Text style={styles.quickReplyText}>{qr.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Écrivez votre message..."
                        placeholderTextColor="#94A3B8"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        onSubmitEditing={() => handleSend()}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={() => handleSend()}
                        disabled={!inputText.trim()}
                    >
                        <Text style={styles.sendButtonText}>📨</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Info */}
                <View style={styles.footerInfo}>
                    <Text style={styles.footerInfoText}>
                        Assistant IA · Répond instantanément · Service gratuit 24/7
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    keyboardView: { flex: 1 },
    header: {
        backgroundColor: '#1E3A8A',
        padding: 20, paddingTop: 10,
        flexDirection: 'row', alignItems: 'center',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    },
    backButton: { color: '#FFFFFF', fontSize: 28, marginRight: 15 },
    headerTitleContainer: { flex: 1 },
    headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: '#BFDBFE', fontSize: 12, marginTop: 2 },
    onlineIndicator: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
    },
    onlineDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#10B981', marginRight: 5,
    },
    onlineText: { color: '#FFFFFF', fontSize: 12 },
    chatContainer: { flex: 1, padding: 15 },
    messageWrapper: {
        flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end',
    },
    userMessageWrapper: { justifyContent: 'flex-end' },
    botMessageWrapper: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#E6F0FF', justifyContent: 'center',
        alignItems: 'center', marginRight: 8,
        borderWidth: 2, borderColor: '#1E3A8A',
    },
    botAvatarText: { fontSize: 18 },
    messageBubble: {
        maxWidth: '75%', padding: 12, borderRadius: 20,
        elevation: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 1,
    },
    userBubble: { backgroundColor: '#1E3A8A', borderTopRightRadius: 4, alignSelf: 'flex-end' },
    botBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 4 },
    typingBubble: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    messageText: { fontSize: 14, lineHeight: 20 },
    userMessageText: { color: '#FFFFFF' },
    botMessageText: { color: '#1E293B' },
    timestamp: { fontSize: 10, color: '#94A3B8', marginTop: 4, alignSelf: 'flex-end' },
    typingText: { color: '#64748B', fontSize: 14, marginLeft: 5 },
    quickRepliesContainer: {
        paddingHorizontal: 15, paddingBottom: 10, maxHeight: 50,
    },
    quickReplyChip: {
        backgroundColor: '#FFFFFF', paddingHorizontal: 15,
        paddingVertical: 8, borderRadius: 20, marginRight: 8,
        borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1, shadowRadius: 1,
    },
    quickReplyText: { color: '#1E293B', fontSize: 13, fontWeight: '500' },
    inputContainer: {
        flexDirection: 'row', padding: 15, paddingTop: 5,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1, borderTopColor: '#E2E8F0',
    },
    input: {
        flex: 1, backgroundColor: '#F1F5F9', borderRadius: 25,
        paddingHorizontal: 20, paddingVertical: 10,
        maxHeight: 100, color: '#1E293B', fontSize: 14,
    },
    sendButton: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#1E3A8A',
        justifyContent: 'center', alignItems: 'center', marginLeft: 10,
    },
    sendButtonDisabled: { backgroundColor: '#94A3B8' },
    sendButtonText: { color: '#FFFFFF', fontSize: 24 },
    footerInfo: { padding: 10, alignItems: 'center' },
    footerInfoText: { color: '#94A3B8', fontSize: 11 },
});

export default ReclamationsScreen;