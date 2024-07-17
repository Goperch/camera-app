import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image, Modal } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const GalleryMenu = ({ isVisible, onClose, onImageSelect }) => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryImages, setGalleryImages] = useState([]);
  const [draftedMedia, setDraftedMedia] = useState([]);

  useEffect(() => {
    if (isVisible) {
      if (activeTab === 'gallery') {
        loadGalleryImages();
      } else if (activeTab === 'draft') {
        loadDraftedMedia();
      }
    }
  }, [isVisible, activeTab]);

  const loadGalleryImages = async () => {
    try {
      const result = await CameraRoll.getPhotos({
        first: 1000,
        assetType: 'Photos',
      });
      setGalleryImages(result.edges);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };

  const loadDraftedMedia = async () => {
    try {
      const drafts = await AsyncStorage.getItem('draftedMedia');
      if (drafts) {
        setDraftedMedia(JSON.parse(drafts));
      }
    } catch (error) {
      console.error('Error loading drafted media:', error);
    }
  };

const handleImageSelect = (image, isDraft = false) => {
  if (isDraft) {
    onImageSelect(image.editedImageUri || image.uri, image);
  } else {
    onImageSelect(image.node.image.uri, null);
  }
  onClose();
};
  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImageSelect(item)}>
      <Image
        source={{ uri: item.node.image.uri }}
        style={{ width: wp('30%'), height: wp('30%'), margin: 2 }}
      />
    </TouchableOpacity>
  );

 const renderDraftItem = ({ item }) => (
  <TouchableOpacity onPress={() => handleImageSelect(item, true)}>
    <Image
      source={{ uri: item.editedImageUri || item.uri }}
      style={{ width: wp('30%'), height: wp('30%'), margin: 2 }}
    />
  </TouchableOpacity>
);

  const renderContent = () => {
    return activeTab === 'gallery' ? (
      <FlatList
        data={galleryImages}
        renderItem={renderGalleryItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
    ) : (
      <FlatList
        data={draftedMedia}
        renderItem={renderDraftItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
      />
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'gallery' && styles.activeTab]}
              onPress={() => setActiveTab('gallery')}
            >
              <Text>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
              onPress={() => setActiveTab('draft')}
            >
              <Text>Draft</Text>
            </TouchableOpacity>
          </View>
          {renderContent()}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'blue',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    borderRadius: 5,
  },
});

export default GalleryMenu;