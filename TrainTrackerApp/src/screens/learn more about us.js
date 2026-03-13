import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LearnMoreScreen = () => {
    const { t, lang } = useLanguage();

    const content = {
        fr: {
            headerTitle: '🚆 À propos de TrainTracker',
            headerSubtitle: 'Votre compagnon de mobilité intelligent pour la ligne de banlieue sud de Tunis.',
            intro: 'Naviguer au quotidien peut s’avérer complexe, c’est pourquoi nous avons créé une application tout-en-un conçue pour rendre votre trajet plus fluide, plus sûr et prévisible. Que vous soyez un navetteur quotidien ou un voyageur occasionnel, TrainTracker met le contrôle de votre trajet dans votre poche.',
            missionTitle: '🌟 Notre Mission',
            mission: 'Notre mission est de moderniser et d’améliorer l’expérience des transports publics à Tunis. En donnant aux navetteurs accès aux données en temps réel et à une assistance numérique instantanée, nous visons à réduire les temps d’attente et le stress de voyage.',
            featuresTitle: '⚡ Fonctionnalités Clés',
            features: [
                { icon: '📍', title: 'Suivi en temps réel', desc: 'Localisez votre train en temps réel sur une carte interactive.' },
                { icon: '🕒', title: 'Horaires précis', desc: 'Consultez les horaires de départ et d’arrivée à jour pour toutes les gares.' },
                { icon: '🔍', title: 'Objets trouvés', desc: 'Signalez un objet perdu ou publiez un objet trouvé pour aider la communauté.' },
                { icon: '💬', title: 'Chatbot intelligent', desc: 'Obtenez des réponses instantanées à vos questions sur le transport 24h/24.' },
                { icon: '🛠️', title: 'Réclamations & Support', desc: 'Signalez un problème et recevez une assistance rapide pour améliorer le service.' },
            ],
            footer: 'Fait avec ❤️ pour les navetteurs de Tunis',
        },
        en: {
            headerTitle: '🚆 About TrainTracker',
            headerSubtitle: 'Your dedicated smart mobility companion for the Tunis southern suburban train line.',
            intro: 'Navigating daily commutes can be challenging, which is why we created an all-in-one application to make your journey smoother, safer, and entirely predictable.',
            missionTitle: '🌟 Our Mission',
            mission: 'Our mission is to modernize the public transportation experience in Tunis by empowering commuters with real-time data and instant digital assistance.',
            featuresTitle: '⚡ Key Features',
            features: [
                { icon: '📍', title: 'Live Train Tracking', desc: 'Monitor the exact location of your train in real-time on an interactive map.' },
                { icon: '🕒', title: 'Accurate Schedules', desc: 'Check up-to-date train arrival and departure times for any station.' },
                { icon: '🔍', title: 'Lost & Found', desc: 'Report lost items or help the community by posting belongings you’ve found.' },
                { icon: '💬', title: 'Smart Chatbot', desc: 'Get immediate automated answers to your transit-related questions 24/7.' },
                { icon: '🛠️', title: 'Complaints & Support', desc: 'Report issues and receive prompt support to help improve transport services.' },
            ],
            footer: 'Made with ❤️ for Tunis commuters',
        },
        ar: {
            headerTitle: '🚆 حول TrainTracker',
            headerSubtitle: 'رفيقك الذكي للتنقل كل يوم عبر خط الضاحية الجنوبية لتونس.',
            intro: 'التنقل اليومي قد يكون تحدياً، لذلك صممنا تطبيقاً متكاملاً يجعل رحلتك أكثر سلاسة وأماناً وقابلية للتنبؤ، سواء كنت متنقلاً يومياً أو بصفة عرضية.',
            missionTitle: '🌟 مهمتنا',
            mission: 'مهمتنا تحديث تجربة النقل العام في تونس عبر تزويد المسافرين ببيانات فورية ومساعدة رقمية فورية.',
            featuresTitle: '⚡ الميزات الرئيسية',
            features: [
                { icon: '📍', title: 'تتبع القطار مباشرة', desc: 'تابع موضع قطارك بدقة على خريطة تفاعلية.' },
                { icon: '🕒', title: 'جداول دقيقة', desc: 'تحقق من مواعيد القطارات في جميع المحطات.' },
                { icon: '🔍', title: 'المفقودات والموجودات', desc: 'بلغ عن غرض مفقود أو ساعد المجتمع بنشر ما عثرت عليه.' },
                { icon: '💬', title: 'بوت ذكي', desc: 'احصل على إجابات فورية 24/7 على أسئلتك.' },
                { icon: '🛠️', title: 'شكاوى ودعم', desc: 'أبلغ عن مشكلة واحصل على دعم سريع لتحسين الخدمة.' },
            ],
            footer: 'صُنع ب❤️ لمسافري تونس',
        },
    };

    const c = content[lang] || content.fr;
    const isRTL = lang === 'ar';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>{c.headerTitle}</Text>
                    <Text style={styles.headerSubtitle}>{c.headerSubtitle}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>{c.intro}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{c.missionTitle}</Text>
                    <Text style={[styles.paragraph, isRTL && styles.rtlText]}>{c.mission}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{c.featuresTitle}</Text>
                    {c.features.map((f, i) => (
                        <View key={i} style={[styles.featureItem, isRTL && styles.rtlRow]}>
                            <Text style={styles.featureIcon}>{f.icon}</Text>
                            <View style={styles.featureTextContainer}>
                                <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>{f.title}</Text>
                                <Text style={[styles.featureDescription, isRTL && styles.rtlText]}>{f.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>{c.footer}</Text>
                    <Text style={styles.footerVersion}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Soft modern background
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E3A8A', // Deep primary blue
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748B', // Slate gray
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5, // For Android shadow
        borderWidth: Platform.OS === 'android' ? 1 : 0,
        borderColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E3A8A',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
        textAlign: 'justify'
    },
    featureItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    featureIcon: {
        fontSize: 28,
        marginRight: 15,
        marginTop: -2, 
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    footerVersion: {
        fontSize: 12,
        color: '#CBD5E1',
        marginTop: 5,
    },
    rtlText: {
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    rtlRow: {
        flexDirection: 'row-reverse',
    },
});

export default LearnMoreScreen;
