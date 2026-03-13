import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { fetchLostItems, createLostItem, updateLostItemStatus, likeLostItem } from '../services/api';

const API_BASE = 'http://192.168.1.10:3000';

const LostAndFoundScreen = ({ navigation }) => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [newPost, setNewPost] = useState({
        author: '',
        item: '',
        description: '',
        location: '',
        item_date: '',
        item_time: '',
        contact: '',
        type: 'lost',
    });

    const loadItems = useCallback(async () => {
        try {
            const data = await fetchLostItems();
            setPublications(data);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les annonces. Vérifiez votre connexion.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const onRefresh = () => {
        setRefreshing(true);
        loadItems();
    };

    const getCurrentDate = () => new Date().toISOString().split('T')[0];
    const getCurrentTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const pickImage = async () => {
        Alert.alert(
            '📷 Ajouter une photo',
            'Choisissez une source',
            [
                {
                    text: '📁 Galerie',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la galerie photo dans les paramètres.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.7,
                        });
                        if (!result.canceled && result.assets.length > 0) {
                            setSelectedImage(result.assets[0]);
                        }
                    }
                },
                {
                    text: '📸 Caméra',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission refusée', 'Veuillez autoriser l\'accès à la caméra dans les paramètres.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [4, 3],
                            quality: 0.7,
                        });
                        if (!result.canceled && result.assets.length > 0) {
                            setSelectedImage(result.assets[0]);
                        }
                    }
                },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleCreatePost = async () => {
        if (!newPost.author.trim() || !newPost.item.trim() || !newPost.description.trim() || !newPost.contact.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', newPost.type);
            formData.append('author', newPost.author.trim());
            formData.append('item', newPost.item.trim());
            formData.append('description', newPost.description.trim());
            formData.append('location', newPost.location.trim());
            formData.append('item_date', newPost.item_date || getCurrentDate());
            formData.append('item_time', newPost.item_time || getCurrentTime());
            formData.append('contact', newPost.contact.trim());

            if (selectedImage) {
                const filename = selectedImage.uri.split('/').pop();
                const ext = filename.split('.').pop().toLowerCase();
                const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
                formData.append('image', {
                    uri: selectedImage.uri,
                    name: filename,
                    type: mimeType,
                });
            }

            const created = await createLostItem(formData);
            setPublications(prev => [created, ...prev]);
            setModalVisible(false);
            setNewPost({ author: '', item: '', description: '', location: '', item_date: '', item_time: '', contact: '', type: 'lost' });
            setSelectedImage(null);
            Alert.alert('✅ Succès', 'Votre annonce a été publiée et sera supprimée automatiquement après 30 jours.');
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de publier l\'annonce. Réessayez.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (id) => {
        try {
            const { likes, is_liked } = await likeLostItem(id);
            setPublications(prev => prev.map(p => p.id === id ? { ...p, likes, is_liked } : p));
        } catch {
            Alert.alert('Erreur', 'Impossible d\'effectuer cette action.');
        }
    };

    const handleResolved = (id) => {
        Alert.alert(
            'Marquer comme résolu',
            'Voulez-vous marquer cette annonce comme résolue ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Oui',
                    onPress: async () => {
                        try {
                            await updateLostItemStatus(id, 'resolved');
                            setPublications(prev => prev.map(p => p.id === id ? { ...p, status: 'resolved' } : p));
                        } catch {
                            Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
                        }
                    }
                }
            ]
        );
    };

    const handleContact = (contact) => {
        Alert.alert('📞 Contact', `Contacter: ${contact}`);
    };

    const getExpiryLabel = (daysRemaining) => {
        if (daysRemaining === null || daysRemaining === undefined) return '';
        if (daysRemaining <= 0) return 'Expiré';
        if (daysRemaining === 1) return 'Expire demain';
        if (daysRemaining <= 5) return `⚠️ Expire dans ${daysRemaining}j`;
        return `Expire dans ${daysRemaining}j`;
    };

    const filteredPublications = publications
        .filter(pub => {
            if (filter === 'all') return true;
            if (filter === 'lost') return pub.type === 'lost' && pub.status === 'active';
            if (filter === 'found') return pub.type === 'found' && pub.status === 'active';
            return true;
        })
        .filter(pub =>
            pub.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (pub.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (pub.location || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    const totalLost = publications.filter(p => p.type === 'lost' && p.status === 'active').length;
    const totalFound = publications.filter(p => p.type === 'found' && p.status === 'active').length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Objets Perdus & Trouvés</Text>
                    <Text style={styles.headerSubtitle}>SNCFT – Banlieue Sud</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un objet, lieu..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearSearch}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {[
                    { key: 'all', label: `Tous (${publications.length})` },
                    { key: 'lost', label: `🔴 Perdus (${totalLost})` },
                    { key: 'found', label: `🟢 Trouvés (${totalFound})` },
                ].map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Publications List */}
            {loading ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#1E3A8A" />
                    <Text style={styles.loadingText}>Chargement des annonces...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.publicationsContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E3A8A" />}
                >
                    {filteredPublications.length > 0 ? filteredPublications.map((pub) => (
                        <View key={pub.id} style={styles.card}>
                            {/* Card Header */}
                            <View style={styles.cardHeader}>
                                <View style={styles.authorInfo}>
                                    <View style={[styles.authorAvatar, pub.type === 'found' && styles.authorAvatarFound]}>
                                        <Text style={styles.authorAvatarText}>{pub.author.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.authorName}>{pub.author}</Text>
                                        <Text style={styles.timestamp}>
                                            {new Date(pub.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[
                                    styles.typeBadge,
                                    pub.type === 'lost' ? styles.lostBadge : styles.foundBadge
                                ]}>
                                    <Text style={styles.typeBadgeText}>
                                        {pub.type === 'lost' ? '🔴 Perdu' : '🟢 Trouvé'}
                                    </Text>
                                </View>
                            </View>

                            {/* Item Photo */}
                            {pub.image_url && (
                                <TouchableOpacity onPress={() => setPreviewImage(`${API_BASE}${pub.image_url}`)}>
                                    <Image
                                        source={{ uri: `${API_BASE}${pub.image_url}` }}
                                        style={styles.itemImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Card Content */}
                            <View style={styles.cardContent}>
                                <Text style={styles.itemTitle}>{pub.item}</Text>
                                <Text style={styles.itemDescription}>{pub.description}</Text>

                                <View style={styles.detailsContainer}>
                                    {pub.location ? (
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailIcon}>📍</Text>
                                            <Text style={styles.detailText}>{pub.location}</Text>
                                        </View>
                                    ) : null}
                                    {pub.item_date ? (
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailIcon}>📅</Text>
                                            <Text style={styles.detailText}>
                                                {pub.item_date} {pub.item_time ? `à ${pub.item_time.substring(0, 5)}` : ''}
                                            </Text>
                                        </View>
                                    ) : null}
                                    <View style={styles.detailItem}>
                                        <Text style={styles.detailIcon}>📞</Text>
                                        <Text style={styles.detailText}>{pub.contact}</Text>
                                    </View>
                                    {pub.days_remaining !== undefined && pub.status === 'active' && (
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailIcon}>🕒</Text>
                                            <Text style={[
                                                styles.detailText,
                                                pub.days_remaining <= 5 && styles.expiryWarning
                                            ]}>
                                                {getExpiryLabel(pub.days_remaining)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                        </View>
                    )) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateEmoji}>{searchQuery ? '🔍' : '📭'}</Text>
                            <Text style={styles.emptyStateTitle}>
                                {searchQuery ? 'Aucun résultat' : 'Aucune annonce'}
                            </Text>
                            <Text style={styles.emptyStateText}>
                                {searchQuery
                                    ? `Aucune annonce ne correspond à "${searchQuery}"`
                                    : 'Soyez le premier à publier une annonce. Appuyez sur + pour commencer.'}
                            </Text>
                        </View>
                    )}
                    <View style={{ height: 20 }} />
                </ScrollView>
            )}

            {/* Create Post Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => !submitting && setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📝 Nouvelle annonce</Text>
                            <TouchableOpacity onPress={() => !submitting && setModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} keyboardShouldPersistTaps="handled">
                            {/* Type Selection */}
                            <View style={styles.typeSelector}>
                                {['lost', 'found'].map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.typeOption, newPost.type === t && (t === 'lost' ? styles.typeOptionLostActive : styles.typeOptionFoundActive)]}
                                        onPress={() => setNewPost({ ...newPost, type: t })}
                                    >
                                        <Text style={[styles.typeOptionText, newPost.type === t && styles.typeOptionTextActive]}>
                                            {t === 'lost' ? '🔴 Perdu' : '🟢 Trouvé'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Photo Picker */}
                            <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage.uri }} style={styles.selectedPhotoPreview} resizeMode="cover" />
                                ) : (
                                    <View style={styles.photoPickerPlaceholder}>
                                        <Text style={styles.photoPickerIcon}>📷</Text>
                                        <Text style={styles.photoPickerText}>Ajouter une photo (optionnel)</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {selectedImage && (
                                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removePhotoButton}>
                                    <Text style={styles.removePhotoText}>✕ Supprimer la photo</Text>
                                </TouchableOpacity>
                            )}

                            {/* Form Fields */}
                            {[
                                { key: 'author', label: 'Votre nom *', placeholder: 'Ex: Ahmed Ben Ali' },
                                { key: 'item', label: 'Objet *', placeholder: 'Ex: Portefeuille noir' },
                                { key: 'location', label: 'Lieu', placeholder: 'Ex: Gare de Tunis, Train de 8h30...' },
                                { key: 'contact', label: 'Contact *', placeholder: 'Téléphone ou email' },
                            ].map(field => (
                                <View key={field.key} style={styles.formGroup}>
                                    <Text style={styles.formLabel}>{field.label}</Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder={field.placeholder}
                                        placeholderTextColor="#94A3B8"
                                        value={newPost[field.key]}
                                        onChangeText={(text) => setNewPost({ ...newPost, [field.key]: text })}
                                    />
                                </View>
                            ))}

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    placeholder="Décrivez l'objet, son contenu, des détails..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={4}
                                    value={newPost.description}
                                    onChangeText={(text) => setNewPost({ ...newPost, description: text })}
                                />
                            </View>

                            <View style={styles.formRow}>
                                {[
                                    { key: 'item_date', label: 'Date', placeholder: 'AAAA-MM-JJ' },
                                    { key: 'item_time', label: 'Heure', placeholder: 'HH:MM' },
                                ].map(field => (
                                    <View key={field.key} style={[styles.formGroup, styles.halfWidth]}>
                                        <Text style={styles.formLabel}>{field.label}</Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder={field.placeholder}
                                            placeholderTextColor="#94A3B8"
                                            value={newPost[field.key]}
                                            onChangeText={(text) => setNewPost({ ...newPost, [field.key]: text })}
                                        />
                                    </View>
                                ))}
                            </View>

                            <View style={styles.expiryNotice}>
                                <Text style={styles.expiryNoticeText}>
                                    🕒 Cette annonce sera automatiquement supprimée après 30 jours.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={handleCreatePost}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>📤 Publier l'annonce</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                visible={!!previewImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPreviewImage(null)}
            >
                <TouchableOpacity
                    style={styles.previewContainer}
                    activeOpacity={1}
                    onPress={() => setPreviewImage(null)}
                >
                    <Image
                        source={{ uri: previewImage }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={styles.closePreviewButton}
                        onPress={() => setPreviewImage(null)}
                    >
                        <Text style={styles.closePreviewText}>✕</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        backgroundColor: '#1E3A8A',
        padding: 20,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: { color: '#FFFFFF', fontSize: 28, marginRight: 15 },
    headerTitleContainer: { flex: 1 },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: '#BFDBFE', fontSize: 12, marginTop: 2 },
    addButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    addButtonText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF', margin: 15, paddingHorizontal: 15,
        borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0',
        elevation: 2,
    },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1E293B' },
    clearSearch: { fontSize: 16, color: '#94A3B8', paddingLeft: 8 },
    filterContainer: { paddingHorizontal: 15, maxHeight: 50, marginBottom: 10 },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0',
    },
    filterChipActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
    filterChipText: { fontSize: 13, color: '#475569' },
    filterChipTextActive: { color: '#FFFFFF' },
    publicationsContainer: { flex: 1, paddingHorizontal: 15 },
    centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15,
        marginBottom: 15, elevation: 3,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 3,
    },
    cardResolved: { opacity: 0.7 },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 12,
    },
    authorInfo: { flexDirection: 'row', alignItems: 'center' },
    authorAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#1E3A8A', justifyContent: 'center',
        alignItems: 'center', marginRight: 10,
    },
    authorAvatarFound: { backgroundColor: '#16A34A' },
    authorAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
    authorName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    timestamp: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    lostBadge: { backgroundColor: '#FEE2E2' },
    foundBadge: { backgroundColor: '#DCFCE7' },
    resolvedBadge: { backgroundColor: '#E5E7EB' },
    typeBadgeText: { fontSize: 11, fontWeight: '600' },
    itemImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 12 },
    cardContent: { marginBottom: 12 },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
    itemDescription: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 10 },
    detailsContainer: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10 },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    detailIcon: { fontSize: 14, marginRight: 8, width: 20 },
    detailText: { fontSize: 12, color: '#64748B', flex: 1 },
    expiryWarning: { color: '#DC2626', fontWeight: '600' },
    cardActions: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15,
    },
    actionIcon: { fontSize: 14, marginRight: 4 },
    actionText: { fontSize: 12, color: '#64748B' },
    contactButton: { backgroundColor: '#1E3A8A', paddingHorizontal: 15, paddingVertical: 6 },
    contactButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyStateEmoji: { fontSize: 60, marginBottom: 15 },
    emptyStateTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
    emptyStateText: { fontSize: 14, color: '#64748B', textAlign: 'center', paddingHorizontal: 40 },
    // Modal
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        flex: 1, backgroundColor: '#FFFFFF',
        marginTop: 50, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
    modalClose: { fontSize: 24, color: '#94A3B8' },
    modalForm: { padding: 20 },
    typeSelector: { flexDirection: 'row', marginBottom: 16, gap: 10 },
    typeOption: {
        flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 2,
        borderColor: '#E2E8F0', alignItems: 'center',
    },
    typeOptionLostActive: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
    typeOptionFoundActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
    typeOptionText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    typeOptionTextActive: { color: '#1E293B' },
    photoPickerButton: {
        borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed',
        borderRadius: 12, marginBottom: 8, overflow: 'hidden',
    },
    photoPickerPlaceholder: {
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 24, backgroundColor: '#F8FAFC',
    },
    photoPickerIcon: { fontSize: 32, marginBottom: 8 },
    photoPickerText: { fontSize: 14, color: '#64748B' },
    selectedPhotoPreview: { width: '100%', height: 180 },
    removePhotoButton: { alignSelf: 'flex-end', marginBottom: 12 },
    removePhotoText: { color: '#DC2626', fontSize: 13 },
    formGroup: { marginBottom: 14 },
    formLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
    formInput: {
        borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#1E293B',
        backgroundColor: '#FAFAFA',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    formRow: { flexDirection: 'row', gap: 12 },
    halfWidth: { flex: 1 },
    expiryNotice: {
        backgroundColor: '#FFF7ED', borderRadius: 10,
        padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A',
    },
    expiryNoticeText: { fontSize: 12, color: '#92400E', textAlign: 'center' },
    submitButton: {
        backgroundColor: '#1E3A8A', paddingVertical: 16,
        borderRadius: 14, alignItems: 'center', marginBottom: 30,
    },
    submitButtonDisabled: { backgroundColor: '#93A5C8' },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    // Preview Modal
    previewContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '95%',
        height: '80%',
    },
    closePreviewButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closePreviewText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default LostAndFoundScreen;