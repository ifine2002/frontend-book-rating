import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetAllFavoriteOfUser, callLikeBook, callDeleteFavoriteBook } from './../../api/services';

// First, create the thunk
export const fetchFavorite = createAsyncThunk(
    'favorite/fetchFavorite',
    async ({ query }) => {
        const response = await callGetAllFavoriteOfUser(query);
        return response;
    }
);

// Thunk để yêu thích sách
export const likeBook = createAsyncThunk(
    'favorite/likeBook',
    async (bookId) => {
        const response = await callLikeBook(bookId);
        return { bookId, response };
    }
);

// Thunk để hủy yêu thích sách
export const unlikeBook = createAsyncThunk(
    'favorite/unlikeBook',
    async (bookId) => {
        const response = await callDeleteFavoriteBook(bookId);
        return { bookId, response };
    }
);

const initialState = {
    isFetching: true,
    data: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: [],
    favoriteBooks: [], // Danh sách ID của các sách đã yêu thích
};

export const favoriteSlide = createSlice({
    name: 'favorite',
    initialState,
    reducers: {
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
        // Thêm sách vào danh sách yêu thích
        addFavorite: (state, action) => {
            if (!state.favoriteBooks.includes(action.payload)) {
                state.favoriteBooks.push(action.payload);
            }
        },
        // Xóa sách khỏi danh sách yêu thích
        removeFavorite: (state, action) => {
            state.favoriteBooks = state.favoriteBooks.filter(id => id !== action.payload);
        },
        // Cập nhật trạng thái yêu thích của sách
        updateBookFavoriteStatus: (state, action) => {
            const { bookId, isLiked } = action.payload;
            if (isLiked && !state.favoriteBooks.includes(bookId)) {
                state.favoriteBooks.push(bookId);
            } else if (!isLiked) {
                state.favoriteBooks = state.favoriteBooks.filter(id => id !== bookId);
            }
        }
    },
    extraReducers: (builder) => {
        // Xử lý fetchFavorite
        builder.addCase(fetchFavorite.pending, (state, action) => {
            state.isFetching = true;
        })
        .addCase(fetchFavorite.rejected, (state, action) => {
            state.isFetching = false;
        })
        .addCase(fetchFavorite.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.data = {
                    page: action.payload.data.page,
                    pageSize: action.payload.data.pageSize,
                    pages: action.payload.data.totalPages,
                    total: action.payload.data.totalElements
                };
                state.result = action.payload.data.result;
                // Cập nhật danh sách sách yêu thích từ kết quả
                state.favoriteBooks = action.payload.data.result.map(book => book.bookId);
            }
        })
        // Xử lý likeBook
        .addCase(likeBook.fulfilled, (state, action) => {
            const { bookId } = action.payload;
            if (!state.favoriteBooks.includes(bookId)) {
                state.favoriteBooks.push(bookId);
            }
        })
        // Xử lý unlikeBook
        .addCase(unlikeBook.fulfilled, (state, action) => {
            const { bookId } = action.payload;
            state.favoriteBooks = state.favoriteBooks.filter(id => id !== bookId);
        });
    },
});

export const {
    setActiveMenu,
    addFavorite,
    removeFavorite,
    updateBookFavoriteStatus
} = favoriteSlide.actions;

export default favoriteSlide.reducer;