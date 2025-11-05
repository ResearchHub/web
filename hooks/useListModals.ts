import { useState, useCallback } from 'react';
import { UserList } from '@/types/user-list';

export function useListModals() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [listName, setListName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = useCallback(() => {
    setListName('');
    setIsCreateModalOpen(true);
  }, []);

  const openEditModal = useCallback((list: UserList) => {
    setSelectedList(list);
    setListName(list.name);
    setIsEditModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((list: UserList) => {
    setSelectedList(list);
    setIsDeleteModalOpen(true);
  }, []);

  const closeModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedList(null);
    setListName('');
    setIsSubmitting(false);
  }, []);

  return {
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedList,
    listName,
    setListName,
    isSubmitting,
    setIsSubmitting,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModals,
  };
}
