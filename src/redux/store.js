import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlice';
import userReducer from './slice/userSlice';
import permissionReducer from './slice/permissionSlice';
import roleReducer from './slice/roleSlice';
import categoryReducer from './slice/categorySlice';

// Tạo store
export const store = configureStore({
    reducer: {
        account: accountReducer,
        user: userReducer,
        permission: permissionReducer,
        role: roleReducer,
        // Thêm các reducer khác vào đây khi cần
        // job: jobReducer,
        // resume: resumeReducer,
        category: categoryReducer,
    },
});

// Export các tiện ích để sử dụng trong app
export const dispatch = store.dispatch;
export const getState = store.getState;

