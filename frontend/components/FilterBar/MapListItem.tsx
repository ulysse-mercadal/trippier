// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState } from 'react';
import { Map } from '../../lib/types';
import {
  IoTrash,
  IoPencil,
  IoEye,
  IoEyeOff,
  IoCheckmark,
  IoClose,
  IoChevronBack,
  IoLockClosed,
  IoLockOpen,
} from 'react-icons/io5';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ConfirmationModal from '../ConfirmationModal';

interface MapListItemProps {
  map: Map;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Map>) => void;
  onClick: (map: Map) => void;
}

export default function MapListItem({ map, onDelete, onUpdate, onClick }: MapListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(map.title);
  const [description, setDescription] = useState(map.description || '');
  const [icon, setIcon] = useState(map.icon || '🌍');
  const [showPicker, setShowPicker] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(map.id, { title, description, icon });
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(map.title);
    setDescription(map.description || '');
    setIcon(map.icon || '🌍');
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmOpen(true);
  };

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(map.id, { isPublic: !map.isPublic });
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-xl border-2 border-black shadow-sm space-y-3 cursor-default">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setShowPicker(!showPicker);
              }}
              className="w-10 h-10 text-xl flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors border border-gray-200">
              {icon}
            </button>
            {showPicker && (
              <div
                className="absolute top-full left-0 mt-2 z-50 shadow-xl rounded-xl w-75 h-87.5"
                onClick={e => e.stopPropagation()}>
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    setIcon(emojiData.emoji);
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
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={title}
              onClick={e => e.stopPropagation()}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all text-black text-sm font-bold"
              placeholder="Map Title"
            />
            <textarea
              value={description}
              onClick={e => e.stopPropagation()}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black transition-all text-black text-xs resize-none h-16"
              placeholder="Description..."
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Cancel">
            <IoClose size={20} />
          </button>
          <button
            onClick={handleSave}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Save">
            <IoCheckmark size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => onClick(map)}
        className="bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group flex items-stretch relative overflow-hidden min-h-20 border border-gray-100">
        <div className="flex-1 p-4 pr-20 flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm shrink-0">
            {map.icon || '🌍'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-1 overflow-hidden">
              <h3 className="font-bold text-gray-900 truncate mr-2">{map.title}</h3>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                {map.pois?.length || 0} poi{map.pois?.length !== 1 ? 's' : ''}
              </span>
            </div>
            {map.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{map.description}</p>
            )}
          </div>
        </div>
        <div
          className={`absolute right-10 top-0 bottom-0 flex items-center justify-center w-12 transition-opacity duration-200 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          <button
            onClick={e => {
              e.stopPropagation();
              onUpdate(map.id, { isVisible: !map.isVisible });
            }}
            className="w-10 h-10 bg-white rounded-xl text-gray-900 flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors">
            {!map.isVisible ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </button>
        </div>
        <div
          className="absolute top-0 bottom-0 right-0 flex"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={e => {
            e.stopPropagation();
            setIsHovered(!isHovered);
          }}>
          <div
            className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ease-out border-l border-gray-100 ${isHovered ? 'w-16' : 'w-0'}`}>
            <button
              onClick={handleDeleteClick}
              className="flex-1 w-full bg-white hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors border-b border-gray-100"
              title="Delete">
              <IoTrash size={18} />
            </button>
            <button
              onClick={handleEditClick}
              className="flex-1 w-full bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors border-b border-gray-100"
              title="Edit">
              <IoPencil size={18} />
            </button>
            <button
              onClick={handleVisibilityClick}
              className={`flex-1 w-full bg-white flex items-center justify-center transition-colors ${map.isPublic ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
              title={map.isPublic ? 'Make Private' : 'Make Public'}>
              {map.isPublic ? <IoLockOpen size={18} /> : <IoLockClosed size={18} />}
            </button>
          </div>
          <div className="w-6 bg-white flex items-center justify-center text-gray-400 z-10 cursor-pointer border-l border-gray-100">
            <div
              className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : 'rotate-0'}`}>
              <IoChevronBack size={14} />
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => onDelete(map.id)}
        title="Delete Map"
        message="Are you sure you want to delete this map?"
        confirmText="Delete"
        cancelText="Back"
        isDanger={true}
      />
    </>
  );
}
