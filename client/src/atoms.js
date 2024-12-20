// atoms.js

import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';
const { persistAtom } = recoilPersist();

export const loadingState = atom({
  key: 'loadingState',
  default: false,
});

export const contentLoadingState = atom({
  key: 'contentLoadingState',
  default: false,
});

export const colorThemeState = atom({
  key: 'colorThemeState',
  default: "dark",
  effects_UNSTABLE: [persistAtom]
});

export const loginState = atom({
  key: 'loginState',
  default: {},
  effects_UNSTABLE: [persistAtom]
});

export const sidebarExpandedState = atom({
  key: 'sidebarExpandedState',
  default: {},
  effects_UNSTABLE: [persistAtom]
});

export const userDataState = atom({
  key: 'userDataState',
  default: {},
});

export const authenticatorPanelState = atom({
  key: 'authPanelState',
  default: false,
});

export const selectedAuthState = atom({
  key: 'selectedAuthState',
  default: null,
});

export const authListState = atom({
  key: 'authListState',
  default: [],
});

export const deleteConfirmState = atom({
  key: 'deleteConfirmState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const imageModalState = atom({
  key: 'imageModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const newTodoModalState = atom({
  key: 'newTodoModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const newDeleteModalState = atom({
  key: 'newDeleteModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const reloadDashboardDataState = atom({
  key: 'reloadDashboardDataState',
  default: true,
});

export const selectedImageState = atom({
  key: 'selectedImageState',
  default: null,
});

export const sidebarItemState = atom({
  key: 'sidebarItemState',
  default: [],
});

export const homepageItemState = atom({
  key: 'homepageItemState',
  default: [],
});

export const reloadFolderListingState = atom({
  key: 'reloadFolderListingState',
  default: true,
});

export const editedTodoState = atom({
  key: 'editedTodoState',
  default: null,
});

export const deletedTodoState = atom({
  key: 'deletedTodoState',
  default: null,
});

export const addedTodoState = atom({
  key: 'addedTodoState',
  default: null,
});

export const integrationInstallModalState = atom({
  key: 'integrationInstallModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deleteIntegrationModalState = atom({
  key: 'deleteIntegrationModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deletedIntegrationState = atom({
  key: 'deletedIntegrationState',
  default: null,
});

export const activeRouteState = atom({
  key: 'activeRouteState',
  default: "/",
});

export const sendmagicPacketState = atom({
  key: 'sendmagicPacketState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const selectedStreamsState = atom({
  key: 'selectedStreamsState',
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const deleteUserModalState = atom({
  key: 'deleteUserModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deletedUserState = atom({
  key: 'deletedUserState',
  default: null,
});

export const changePasswordModalState = atom({
  key: 'changePasswordModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deletePageModalState = atom({
  key: 'deletePageModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const changedPageState = atom({
  key: 'changedPageState',
  default: null,
});

export const publishPageModalState = atom({
  key: 'publishPageModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const filterQueryState = atom({
  key: 'filterQueryState',
  default: null,
});

export const isFilterVisibleState = atom({
  key: 'isFilterVisibleState',
  default: "",
});

export const moveItemState = atom({
  key: 'moveItemState',
  default: null,
});

export const weatherDataState = atom({
  key: 'weatherDataState',
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const weatherLocationSearchModalState = atom({
  key: 'weatherLocationSearchModalState',
  default: false
});

export const weatherLocationSelectedState = atom({
  key: 'weatherLocationSelectedState',
  default: null
});

export const newSnippetModalState = atom({
  key: 'newSnippetModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const newSnippetCodeModalState = atom({
  key: 'newSnippetCodeModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const newDeleteCodeModalState = atom({
  key: 'newDeleteCodeModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deleteSnippetModalState = atom({
  key: 'deleteSnippetModalState',
  default: {
    isOpen: false,
    data: null,
  },
});

export const deletedSnippetState = atom({
  key: 'deletedSnippetState',
  default: null,
});

export const savedSnippetState = atom({
  key: 'savedSnippetState',
  default: null,
});

export const quickPreviewStreamState = atom({
  key: 'quickPreviewStreamState',
  default: null,
  effects: [
    ({ onSet, setSelf }) => {
      let timeoutId = null;

      onSet((newValue) => {
        // Clear the existing timer whenever the value is updated
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Set a new timer to reset the value to null after 30 seconds
        if (newValue !== null) {
          timeoutId = setTimeout(() => {
            setSelf(null);
          }, 120 * 1000); // 30 seconds
        }
      });

      // Cleanup when the atom is no longer in use
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    },
  ],
});
