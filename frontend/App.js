import { USE_MOCK_ONLY, API_ENDPOINT_URL } from "@env";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
    Camera,
    Instagram,
    MapPin,
    Search,
    Upload,
    User,
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Web用のフォント設定をシンプルに
const webFontFamily = Platform.OS === "web"
    ? {
        fontFamily: "system-ui, -apple-system, sans-serif",
    }
    : {};

// テスト用：trueにするとCloud Run APIを呼ばずに直接モックデータを返す
const useMock = USE_MOCK_ONLY === "true";

// Cloud Run API のエンドポイント URL（環境変数から読み込み、デフォルト値を設定）
const API_URL = API_ENDPOINT_URL || "dummy";

// モック用のレスポンスデータ
const MOCK_RESPONSE = {
    images: [
        {
            imageUrl:
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/paris_wedding_photos",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/romantic_moments_paris",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/eiffel_captures",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/paris_love_stories",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/french_wedding_photo",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/parisian_photographer",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/seine_wedding_shots",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/montmartre_memories",
        },
        {
            imageUrl:
                "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=400&h=400&fit=crop",
            instagramUrl: "https://instagram.com/louvre_love_photos",
        },
    ],
};

// 言語オプション
const LANGUAGE_OPTIONS = [
    { label: "言語を選択してください", value: "" },
    { label: "日本語", value: "japanese" },
    { label: "English", value: "english" },
];

// 画像をBase64に変換する関数
const convertImageToBase64 = async (imageUri) => {
    try {
        if (Platform.OS === 'web') {
            // Web環境の場合はfetchを使用してBlobを取得し、Base64に変換
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else {
            // ネイティブ環境の場合はFileSystemを使用
            const base64 = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return `data:image/jpeg;base64,${base64}`;
        }
    } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
    }
};

export default function BeforeTheHoneymoon() {
    const [destination, setDestination] = useState("");
    const [preferredLanguage, setPreferredLanguage] = useState("");
    const [showLanguagePicker, setShowLanguagePicker] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [error, setError] = useState(null);

    const handleImageUpload = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                Alert.alert("権限エラー", "写真ライブラリへのアクセス権限が必要です");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setUploadedImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert("エラー", "画像の選択中にエラーが発生しました");
        }
    };

    const handleSearch = async () => {
        if (!destination || !preferredLanguage || !uploadedImage) {
            Alert.alert("エラー", "すべての項目を入力してください");
            return;
        }

        setIsSearching(true);
        setError(null);

        // デバッグ情報をコンソールに出力
        console.log("=== DEBUG INFO ===");
        console.log("USE_MOCK_ONLY:", USE_MOCK_ONLY);
        console.log("useMock:", useMock);
        console.log("API_URL:", API_URL);
        console.log("destination:", destination);
        console.log("preferredLanguage:", preferredLanguage);
        console.log("uploadedImage:", uploadedImage ? "present" : "missing");

        try {
            // モック専用モードの場合
            if (useMock) {
                console.log("Using mock mode - not calling real API");
                // モック用の遅延
                await new Promise(resolve => setTimeout(resolve, 1500));
                setSearchResults(MOCK_RESPONSE.images);
                Alert.alert(
                    "モックモード",
                    "テスト用のモックデータを表示しています。",
                );
                return;
            }

            console.log("Making real API call to:", `${API_URL}/searchPhotographers`);

            // 画像をBase64エンコード
            const base64Image = await convertImageToBase64(uploadedImage);
            
            // Cloud Run API に送信するデータ
            const requestData = {
                destination: destination,
                preferredLanguage: preferredLanguage,
                referenceImage: base64Image,
            };

            console.log("Request data:", requestData);
            
            const response = await fetch(`${API_URL}/searchPhotographers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Error response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const result = await response.json();
            console.log("API Response:", result);

            // 結果が期待される形式かチェック
            if (result && result.images && Array.isArray(result.images)) {
                setSearchResults(result.images);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Search error:", error);
            console.error("Error details:", error.message);
            setError(`検索中にエラーが発生しました: ${error.message}`);
            Alert.alert(
                "エラー",
                `フォトグラファーの検索中にエラーが発生しました: ${error.message}`,
            );
        } finally {
            setIsSearching(false);
        }
    };

    const handleImageClick = (instagramUrl) => {
        if (instagramUrl) {
            Linking.openURL(instagramUrl);
        }
    };

    const resetSearch = () => {
        setSearchResults(null);
        setError(null);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.inner}>
                    {/* ヘッダー */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Before the honeymoon</Text>
                        <Text style={styles.subtitle}>
                            海外で理想のフォトグラファーを見つけよう
                        </Text>
                    </View>

                    {!searchResults
                        ? (
                            // 検索フォーム
                            <View style={styles.formBox}>
                                {/* 行き先入力 */}
                                <View style={styles.inputBlock}>
                                    <View style={styles.labelRow}>
                                        <MapPin
                                            size={20}
                                            color="#a855f7"
                                            style={styles.icon}
                                        />
                                        <Text style={styles.label}>行き先</Text>
                                    </View>
                                    <TextInput
                                        placeholder="例: パリ、グアム、モントリオール"
                                        value={destination}
                                        onChangeText={setDestination}
                                        style={styles.input}
                                        placeholderTextColor="#aaa"
                                    />
                                </View>

                                {/* 言語選択 */}
                                <View style={styles.inputBlock}>
                                    <View style={styles.labelRow}>
                                        <User
                                            size={20}
                                            color="#a855f7"
                                            style={styles.icon}
                                        />
                                        <Text style={styles.label}>
                                            希望する言語
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.pickerButton}
                                        onPress={() =>
                                            setShowLanguagePicker(true)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerButtonText,
                                                !preferredLanguage
                                                && styles.pickerPlaceholder,
                                            ]}
                                        >
                                            {preferredLanguage
                                                ? LANGUAGE_OPTIONS.find(lang =>
                                                    lang.value
                                                    === preferredLanguage
                                                )?.label
                                                : "言語を選択してください"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* 画像アップロード */}
                                <View style={styles.inputBlock}>
                                    <View style={styles.labelRow}>
                                        <Camera
                                            size={20}
                                            color="#a855f7"
                                            style={styles.icon}
                                        />
                                        <Text style={styles.label}>
                                            参考にしたい写真
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.uploadBox}
                                        onPress={uploadedImage
                                            ? () => setUploadedImage(null)
                                            : handleImageUpload}
                                        activeOpacity={0.8}
                                    >
                                        {uploadedImage
                                            ? (
                                                <View
                                                    style={{
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri: uploadedImage,
                                                        }}
                                                        style={styles
                                                            .uploadedImage}
                                                    />
                                                    <Text
                                                        style={styles
                                                            .deleteText}
                                                    >
                                                        画像を削除
                                                    </Text>
                                                </View>
                                            )
                                            : (
                                                <View
                                                    style={{
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Upload
                                                        size={48}
                                                        color="#aaa"
                                                    />
                                                    <Text
                                                        style={styles
                                                            .uploadText}
                                                    >
                                                        タップして画像をアップロード
                                                    </Text>
                                                </View>
                                            )}
                                    </TouchableOpacity>
                                </View>

                                {/* 検索ボタン */}
                                <TouchableOpacity
                                    onPress={handleSearch}
                                    disabled={isSearching}
                                    style={[
                                        styles.searchButton,
                                        isSearching
                                        && { backgroundColor: "#ddd" },
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    {isSearching
                                        ? <ActivityIndicator color="#fff" />
                                        : (
                                            <View
                                                style={styles
                                                    .searchButtonContent}
                                            >
                                                <Search
                                                    size={20}
                                                    color="#fff"
                                                />
                                                <Text
                                                    style={styles
                                                        .searchButtonText}
                                                >
                                                    フォトグラファーを探す
                                                </Text>
                                            </View>
                                        )}
                                </TouchableOpacity>
                            </View>
                        )
                        : (
                            // 検索結果
                            <View>
                                <TouchableOpacity
                                    onPress={resetSearch}
                                    style={styles.backButton}
                                >
                                    <Text style={styles.backButtonText}>
                                        ← 検索条件を変更
                                    </Text>
                                </TouchableOpacity>

                                {error
                                    ? (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorText}>
                                                {error}
                                            </Text>
                                        </View>
                                    )
                                    : (
                                        <View style={styles.resultsContainer}>
                                            <Text style={styles.resultsTitle}>
                                                フォトグラファーが見つかりました！
                                            </Text>
                                            <Text
                                                style={styles.resultsSubtitle}
                                            >
                                                画像をタップしてInstagramを確認
                                            </Text>
                                            <View style={styles.imageGrid}>
                                                {searchResults
                                                    && searchResults.slice(0, 9)
                                                        .map((
                                                            item,
                                                            index,
                                                        ) => (
                                                            <TouchableOpacity
                                                                key={index}
                                                                style={styles
                                                                    .gridItem}
                                                                onPress={() =>
                                                                    handleImageClick(
                                                                        item.instagramUrl,
                                                                    )}
                                                                activeOpacity={0.8}
                                                            >
                                                                <Image
                                                                    source={{
                                                                        uri: item
                                                                            .imageUrl,
                                                                    }}
                                                                    style={styles
                                                                        .gridImage}
                                                                    resizeMode="cover"
                                                                />
                                                                <View
                                                                    style={styles
                                                                        .imageOverlay}
                                                                >
                                                                    <Instagram
                                                                        size={24}
                                                                        color="#fff"
                                                                    />
                                                                </View>
                                                            </TouchableOpacity>
                                                        ))}
                                            </View>
                                        </View>
                                    )}
                            </View>
                        )}
                </View>
            </ScrollView>

            {/* 言語選択モーダル */}
            <Modal
                visible={showLanguagePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowLanguagePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>言語を選択</Text>
                            <TouchableOpacity
                                onPress={() => setShowLanguagePicker(false)}
                                style={styles.modalCloseButton}
                            >
                                <Text style={styles.modalCloseText}>×</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            {LANGUAGE_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.modalOption,
                                        preferredLanguage === option.value
                                        && styles.modalSelectedOption,
                                    ]}
                                    onPress={() => {
                                        setPreferredLanguage(option.value);
                                        setShowLanguagePicker(false);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            preferredLanguage === option.value
                                            && styles.modalSelectedOptionText,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {preferredLanguage === option.value && (
                                        <Text style={styles.checkMark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fdf6fb",
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    inner: {
        maxWidth: 800,
        alignSelf: "center",
        width: "100%",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
        paddingTop: 80,
        minHeight: 200,
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginBottom: 8,
        ...webFontFamily,
    },
    subtitle: {
        color: "#666",
        fontSize: 16,
        ...webFontFamily,
    },
    formBox: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    inputBlock: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    label: {
        fontWeight: "bold",
        color: "#333",
        fontSize: 16,
        ...webFontFamily,
    },
    icon: {
        marginRight: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: Platform.OS === "ios" ? 14 : 10,
        backgroundColor: "#fafafa",
        fontSize: 16,
        ...webFontFamily,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    uploadText: {
        color: "#666",
        marginTop: 8,
        ...webFontFamily,
    },
    uploadedImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    deleteText: {
        color: "red",
        marginTop: 4,
        fontWeight: "bold",
        ...webFontFamily,
    },
    searchButton: {
        backgroundColor: "#a855f7",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    searchButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
        fontSize: 16,
        ...webFontFamily,
    },
    pickerButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: Platform.OS === "ios" ? 14 : 10,
        backgroundColor: "#fafafa",
        minHeight: 50,
        justifyContent: "center",
    },
    pickerButtonText: {
        fontSize: 16,
        color: "#333",
        ...webFontFamily,
    },
    pickerPlaceholder: {
        color: "#aaa",
        ...webFontFamily,
    },
    // モーダル関連のスタイル
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 400,
        maxHeight: "80%",
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        ...webFontFamily,
    },
    modalCloseButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    modalCloseText: {
        fontSize: 18,
        color: "#666",
        ...webFontFamily,
    },
    modalScrollView: {
        maxHeight: 300,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    modalSelectedOption: {
        backgroundColor: "#f3e8ff",
    },
    modalOptionText: {
        fontSize: 16,
        color: "#333",
        ...webFontFamily,
    },
    modalSelectedOptionText: {
        color: "#a855f7",
        fontWeight: "bold",
        ...webFontFamily,
    },
    checkMark: {
        fontSize: 16,
        color: "#a855f7",
        fontWeight: "bold",
        ...webFontFamily,
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: "#a855f7",
        fontWeight: "bold",
        fontSize: 16,
        ...webFontFamily,
    },
    errorBox: {
        backgroundColor: "#fee2e2",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    errorText: {
        color: "#dc2626",
        fontSize: 16,
        textAlign: "center",
        ...webFontFamily,
    },
    resultsContainer: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2d2d2d",
        textAlign: "center",
        marginBottom: 8,
        ...webFontFamily,
    },
    resultsSubtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
        ...webFontFamily,
    },
    imageGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridItem: {
        width: "31%",
        aspectRatio: 1,
        marginBottom: 12,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    gridImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
    },
    imageOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.6)",
        borderRadius: 20,
        padding: 6,
    },
});
