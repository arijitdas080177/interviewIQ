import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { SUPPORTED_UPLOAD_MIME_TYPES } from "@interviewiq/shared";

interface FileUploadCardProps {
  fileName: string | null;
  onPicked: (file: { uri: string; name: string; mimeType: string }) => Promise<void>;
}

export function FileUploadCard({ fileName, onPicked }: FileUploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: SUPPORTED_UPLOAD_MIME_TYPES,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      await onPicked({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      <Pressable
        onPress={handlePress}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel={fileName ? `Replace uploaded file, currently ${fileName}` : "Upload a file"}
        importantForAccessibility="no-hide-descendants"
        className="min-h-[220px] rounded-xl border-2 border-dashed border-navy-200 dark:border-navy-600 bg-navy-50 dark:bg-navy-800 items-center justify-center p-6"
      >
        {uploading ? (
          <ActivityIndicator />
        ) : fileName ? (
          <>
            <Text className="text-2xl mb-2">📄</Text>
            <Text className="text-navy-900 dark:text-white font-medium text-center">{fileName}</Text>
            <Text className="text-navy-400 dark:text-navy-300 text-sm mt-1">Tap to replace</Text>
          </>
        ) : (
          <>
            <Text className="text-2xl mb-2">⬆️</Text>
            <Text className="text-navy-700 dark:text-navy-100 font-medium">Tap to choose a file</Text>
            <Text className="text-navy-400 dark:text-navy-300 text-sm mt-1">PDF, DOCX, or TXT</Text>
          </>
        )}
      </Pressable>
      {error ? (
        <Text className="text-red-600 dark:text-red-300 text-sm mt-2" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
