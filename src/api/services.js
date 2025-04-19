import axios from './axios';

/**
 *
 *Module Auth
 */

export const callRegister = (email, password, fullName) => {
  const data = {
    email: email,
    password: password,
    fullName: fullName
  }
  return axios.post('/auth/register', data)
}

export const callLogin = (email, password) => {
  const data = {
    email: email,
    password: password
  }
  return axios.post('/auth/login', data)
}

export const callFetchAccount = () => {
  return axios.get('/auth/account');
}

export const callRefreshToken = () => {
  return axios.get('/auth/refresh')
}

export const callLogout = () => {
  return axios.post('/auth/logout')
}

/**
 *
 *Module User
 */

export const callCreateUser = (userData) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append('fullName', userData.fullName);
  if (userData.email) formData.append('email', userData.email);
  if (userData.password) formData.append('password', userData.password);

  // Xử lý file image
  if (userData.image) formData.append('image', userData.image);

  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('userDOB', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('userDOB', userData.userDOB);
    }
  }

  if (userData.address) formData.append('address', userData.address);
  if (userData.status) formData.append('status', userData.status);
  if (userData.roleId !== undefined) formData.append('roleId', userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.post('/user/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callUpdateUser = (userData, userId) => {
  // Tạo FormData object
  const formData = new FormData();

  // Thêm các trường dữ liệu từ userData vào formData theo đúng tên thuộc tính trong ReqCreateUser
  if (userData.fullName) formData.append('fullName', userData.fullName);

  // Xử lý file image hoặc flag xóa image
  if (userData.image) {
    formData.append('image', userData.image);
  } else if (userData.deleteImage === true) {
    // Thêm flag xóa ảnh
    formData.append('deleteImage', 'true');
  }

  if (userData.phone) formData.append('phone', userData.phone);
  if (userData.gender) formData.append('gender', userData.gender);

  // Chuyển đổi date thành định dạng ISO cho LocalDate
  if (userData.userDOB) {
    // Nếu là Date object
    if (userData.userDOB instanceof Date) {
      const isoDate = userData.userDOB.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      formData.append('userDOB', isoDate);
    } else {
      // Nếu đã là string đúng định dạng
      formData.append('userDOB', userData.userDOB);
    }
  }

  if (userData.address) formData.append('address', userData.address);
  if (userData.status) formData.append('status', userData.status);
  if (userData.roleId !== undefined) formData.append('roleId', userData.roleId);

  // Gửi request với content-type là multipart/form-data
  return axios.put(`/user/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export const callDeleteUser = (id) => {
  return axios.delete(`/user/${id}`);
}

export const callFetchUser = (query) => {
  return axios.get(`/user/list?${query}`);
}

export const callFetchUserDetail = (id) => {
  return axios.get(`/user/detail/${id}`);
}

/**
 *
Module Role
 */
export const callCreateRole = (role) => {
  return axios.post('/role/', {
    name: role.name,
    description: role.description,
    permissions: role.permissions
  })
}

export const callUpdateRole = (role, id) => {
  return axios.put(`/role/${id}`, {
    name: role.name,
    description: role.description,
    active: role.isActive,
    permissions: role.permissions
  })
}

export const callDeleteRole = (id) => {
  return axios.delete(`/role/${id}`);
}

export const callFetchRole = (query) => {
  return axios.get(`/role/list?${query}`);
}

export const callFetchRoleById = (id) => {
  return axios.get(`/role/${id}`);
}

/**
 *
Module Permission
 */
export const callCreatePermission = (permission) => {
  return axios.post('/permission/', {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module
  })
}

export const callUpdatePermission = (permission, id) => {
  return axios.put(`/permission/${id}`, {
    name: permission.name,
    apiPath: permission.apiPath,
    method: permission.method,
    module: permission.module
  })
}

export const callDeletePermission = (id) => {
  return axios.delete(`/permission/${id}`);
}

export const callFetchPermission = (query) => {
  return axios.get(`/permission/list?${query}`);
}

export const callFetchPermissionById = (id) => {
  return axios.get(`/permission/${id}`);
}