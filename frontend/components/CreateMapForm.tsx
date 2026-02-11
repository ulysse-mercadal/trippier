// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState } from 'react';
import { IoAdd, IoClose } from 'react-icons/io5';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import client from '../lib/client';

interface CreateMapFormProps {
  onMapCreated: () => void;
}

export default function CreateMapForm({ onMapCreated }: CreateMapFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🌍');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      return;
    }

    setLoading(true);
    try {
      await client.post('/maps', {
        title: name,
        description,
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
      alert('Failed to create map. Please try logging out and back in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-6">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full h-12 rounded-xl border-2 border-black text-black flex items-center justify-center font-semibold hover:bg-gray-50 transition-colors">
          <IoAdd size={24} className="mr-2" />
          Create New Map
        </button>
      ) : (
        <div className="bg-white rounded-xl border-2 border-black shadow-lg">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-black">New Map</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full">
                <IoClose size={20} className="text-black" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="w-12 h-12 text-2xl flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors border border-gray-200">
                    {emoji}
                  </button>
                  {showPicker && (
                    <div className="absolute top-full left-0 mt-2 z-50 shadow-xl rounded-xl w-[320px] h-100">
                      <EmojiPicker
                        onEmojiClick={(emojiData: EmojiClickData) => {
                          setEmoji(emojiData.emoji);
                          setShowPicker(false);
                        }}
                        width="100%"
                        height="100%"
                        lazyLoadEmojis={true}
                        searchDisabled={false}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="My Awesome Trip"
                    className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all text-black"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Plan for summer 2026..."
                  className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all h-20 resize-none text-black"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Map'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
