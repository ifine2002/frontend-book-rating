import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import userReducer from './slice/userSlice';
import permissionReducer from './slice/permissionSlice';
// Import thêm các reducer khác khi cần

// Tạo store
export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        permission: permissionReducer,
        // Thêm các reducer khác vào đây khi cần
        // job: jobReducer,
        // resume: resumeReducer,
        // role: roleReducer,
        // skill: skillReducer,
    },
});

// Export các tiện ích để sử dụng trong app
export const dispatch = store.dispatch;
export const getState = store.getState;

