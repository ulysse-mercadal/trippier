// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import client from '../api/client';

interface CreateMapFormProps {
  onMapCreated: () => void;
  initialExpanded?: boolean;
}

export default function CreateMapForm({
  onMapCreated,
  initialExpanded = false,
}: CreateMapFormProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌍');
  const [loading, setLoading] = useState(false);
  const emojiInputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await client.post('/maps', {
        title: name.trim(),
        description: description.trim(),
        icon: emoji,
        isPublic: false,
      });
      setIsExpanded(false);
      setName('');
      setDescription('');
      setEmoji('🌍');
      onMapCreated();
    } catch (error) {
      console.error('Failed to create map:', error);
      Alert.alert('Error', 'Failed to create map. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiPress = () => {
    emojiInputRef.current?.focus();
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setIsExpanded(true)}
        activeOpacity={0.7}>
        <Ionicons name="add" size={24} color="#000" />
        <Text style={styles.expandButtonText}>Create New Map</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Map</Text>
        <TouchableOpacity
          onPress={() => setIsExpanded(false)}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.topRow}>
          <View style={styles.emojiContainer}>
            <Text style={styles.fieldLabel}>Icon</Text>
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={handleEmojiPress}
              activeOpacity={0.7}>
              <Text style={styles.emojiDisplay}>{emoji}</Text>
              <TextInput
                ref={emojiInputRef}
                style={styles.hiddenInput}
                value={emoji}
                onChangeText={text => {
                  if (text.length > 0) {
                    const chars = Array.from(text);
                    setEmoji(chars[chars.length - 1]);
                  }
                }}
                caretHidden
                showSoftInputOnFocus={true}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="My Awesome Trip"
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Plan for summer 2026..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!name.trim() || loading) && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={!name.trim() || loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Map</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  expandButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
  },
  expandButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#000',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  closeButton: {
    padding: 2,
  },
  form: {
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiContainer: {
    width: 60,
  },
  nameContainer: {
    flex: 1,
  },
  fieldContainer: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emojiButton: {
    width: 52,
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emojiDisplay: {
    fontSize: 26,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 52,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
});
