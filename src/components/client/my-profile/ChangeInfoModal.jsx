import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker } from '@ant-design/pro-components';
import { Upload, Avatar, Button, Form, message } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { callFetchUserDetail, callUpdateUserProfile } from "./../../../api/services";
import dayjs from 'dayjs';
import '../../../styles/ChangeInfoModal.scss';
import { isMobile } from 'react-device-detect';

const ChangeInfoModal = ({ editProfileVisible, setEditProfileVisible, id }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isDeleteImage, setIsDeleteImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const uploadRef = useRef();

  useEffect(() => {
    if (editProfileVisible && id) {
      callFetchUserDetail(id)
        .then(res => {
          const data = res.data;
          form.setFieldsValue({
            fullName: data.fullName || '',
            gender: data.gender || '',
            userDOB: data.userDOB ? dayjs(data.userDOB) : null,
            address: data.address || '',
            phone: data.phone || '',
          });
          if (data.image) {
            setFileList([
              {
                uid: '-1',
                name: 'avatar.png',
                status: 'done',
                url: data.image,
              }
            ]);
            setAvatarUrl(data.image);
          } else {
            setFileList([]);
            setAvatarUrl(null);
          }
          setIsDeleteImage(false);
        })
        .catch(err => {});
    }
    if (!editProfileVisible) {
      form.resetFields();
      setFileList([]);
      setAvatarUrl(null);
      setIsDeleteImage(false);
    }
  }, [editProfileVisible, id, form]);

  // Validate file trước khi upload
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Hình ảnh phải nhỏ hơn 10MB!');
    }
    return isJpgOrPng && isLt10M;
  };

  // Xử lý khi upload hoặc xóa ảnh
  const handleChangeUpload = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      setIsDeleteImage(false);
      setAvatarUrl(null);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setIsDeleteImage(true);
    setAvatarUrl(null);
    return true;
  };

  const handleReset = async () => {
    form.resetFields();
    setFileList([]);
    setIsDeleteImage(false);
    setEditProfileVisible(false);
}

  const handleFinish = async (values) => {
    let image = undefined;
    if (fileList.length > 0 && fileList[0].originFileObj) {
      image = fileList[0].originFileObj;
    }
    const payload = {
      ...values,
      image,
      deleteImage: isDeleteImage ? true : undefined,
    };
    console.log(payload);
    const res = await callUpdateUserProfile(payload);
    if (res && res.data) {
      message.success('Cập nhật thành công!');
    } else {
      message.error('Cập nhật thất bại!');
    }
  };

  return (
    <ModalForm
      title={<span className="text-2xl font-bold flex justify-center items-center mb-6">Chỉnh sửa trang cá nhân</span>}
      open={editProfileVisible}
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {handleReset()},
        style: { top: 70 },
        afterClose: () => handleReset(),
        destroyOnClose: true,
        width: isMobile ? "100%" : 800,
        keyboard: false,
        maskClosable: true,
        okText: "Lưu",
        cancelText: "Hủy",
        getContainer: false
      }}
      scrollToFirstError={true}
      preserve={false}
      form={form}
      onFinish={handleFinish}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cột trái: Ảnh đại diện */}
        <div className="flex flex-col items-center md:w-1/3">
          <span className="font-bold mb-4 mt-2">Ảnh đại diện</span>
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={
              fileList.length > 0 && fileList[0].originFileObj
                ? URL.createObjectURL(fileList[0].originFileObj)
                : avatarUrl
            }
          />
          <Upload
            ref={uploadRef}
            style={{ display: 'none' }}
            beforeUpload={beforeUpload}
            onChange={handleChangeUpload}
            onRemove={handleRemove}
            maxCount={1}
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
          />
          {fileList.length < 1 && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              size="small"
              className="mt-2"
              onClick={() => {
                document.querySelector('input[type=file]').click();
              }}
            >
              Thêm
            </Button>
          )}
          {fileList.length === 1 && (
            <Button danger type="link" onClick={handleRemove}>Xóa ảnh</Button>
          )}
        </div>
        {/* Cột phải: Thông tin cá nhân */}
        <div className="flex-1 grid grid-cols-1">
          <ProFormText
            name="fullName"
            label="Họ và tên"
            placeholder="Nhập họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          />
          <ProFormSelect
            name="gender"
            label="Giới tính"
            options={[
              { label: 'Nam', value: 'MALE' },
              { label: 'Nữ', value: 'FEMALE' },
              { label: 'Khác', value: 'OTHER' },
            ]}
            placeholder="Chọn giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          />
          <ProFormDatePicker
            name="userDOB"
            label="Ngày sinh"
            placeholder="Chọn ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          />
          <ProFormText
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
            placeholder="Nhập phone"
          />
          <ProFormText
            name="address"
            label="Địa chỉ"
            placeholder="Nhập địa chỉ"
          />
        </div>
      </div>
    </ModalForm>
  );
};

export default ChangeInfoModal;
