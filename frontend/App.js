import { USE_MOCK_ONLY } from "@env";
import {
    Camera,
    Instagram,
    MapPin,
    Search,
    Upload,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// テスト用：trueにするとCloud Functionを呼ばずに直接モックデータを返す
const useMock = USE_MOCK_ONLY === "true" ? true : false;

// Cloud Function のエンドポイント URL（実際のURLに変更してください）
const CLOUD_FUNCTION_URL =
    "https://your-cloud-function-url.cloudfunctions.net/searchPhotographers";

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

export default function BeforeTheHoneymoon() {
    const [destination, setDestination] = useState("");
    const [nationality, setNationality] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [error, setError] = useState(null);

    // 画像アップロード（デモ: 実際はImagePicker等を使う）
    const handleImageUpload = async () => {
        Alert.alert(
            "画像アップロード",
            "実際の画像アップロードは未実装です。\nデモ用画像をセットします。",
            [
                {
                    text: "OK",
                    onPress: () =>
                        setUploadedImage(
                            "https://images.unsplash.com/photo-1519741497674-611481863552",
                        ),
                },
            ],
        );
    };

    const handleSearch = async () => {
        if (!destination || !nationality || !uploadedImage) {
            Alert.alert("エラー", "すべての項目を入力してください");
            return;
        }

        setIsSearching(true);
        setError(null);

        try {
            // モック専用モードの場合
            if (useMock) {
                // モック用の遅延
                await new Promise(resolve => setTimeout(resolve, 1500));
                setSearchResults(MOCK_RESPONSE.images);
                Alert.alert(
                    "モックモード",
                    "テスト用のモックデータを表示しています。",
                );
                return;
            }

            // Cloud Function に送信するデータ
            const requestData = {
                destination: destination,
                nationality: nationality,
                referenceImage: uploadedImage,
            };

            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // 結果が期待される形式かチェック
            if (result && result.images && Array.isArray(result.images)) {
                setSearchResults(result.images);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Search error:", error);
            setError("検索中にエラーが発生しました。もう一度お試しください。");
            Alert.alert(
                "エラー",
                "フォトグラファーの検索中にエラーが発生しました。",
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
        <ScrollView
            style={styles.container}
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
                                    placeholder="例: パリ、グアム、バリ島"
                                    value={destination}
                                    onChangeText={setDestination}
                                    style={styles.input}
                                    placeholderTextColor="#aaa"
                                />
                            </View>

                            {/* 国籍入力 */}
                            <View style={styles.inputBlock}>
                                <View style={styles.labelRow}>
                                    <User
                                        size={20}
                                        color="#a855f7"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.label}>
                                        あなたの国籍
                                    </Text>
                                </View>
                                <TextInput
                                    placeholder="例: 日本人、韓国人、アメリカ人"
                                    value={nationality}
                                    onChangeText={setNationality}
                                    style={styles.input}
                                    placeholderTextColor="#aaa"
                                />
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
                                                style={{ alignItems: "center" }}
                                            >
                                                <Image
                                                    source={{
                                                        uri: uploadedImage,
                                                    }}
                                                    style={styles.uploadedImage}
                                                />
                                                <Text style={styles.deleteText}>
                                                    画像を削除
                                                </Text>
                                            </View>
                                        )
                                        : (
                                            <View
                                                style={{ alignItems: "center" }}
                                            >
                                                <Upload
                                                    size={48}
                                                    color="#aaa"
                                                />
                                                <Text style={styles.uploadText}>
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
                                    isSearching && { backgroundColor: "#ddd" },
                                ]}
                                activeOpacity={0.8}
                            >
                                {isSearching
                                    ? <ActivityIndicator color="#fff" />
                                    : (
                                        <View
                                            style={styles.searchButtonContent}
                                        >
                                            <Search size={20} color="#fff" />
                                            <Text
                                                style={styles.searchButtonText}
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
                                        <Text style={styles.resultsSubtitle}>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fdf6fb",
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
    },
    subtitle: {
        color: "#666",
        fontSize: 16,
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
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: "#a855f7",
        fontWeight: "bold",
        fontSize: 16,
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
    },
    resultsSubtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
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
