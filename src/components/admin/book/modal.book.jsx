import { ModalForm, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification, Upload, Select } from "antd";
import { PlusOutlined, MonitorOutlined  } from '@ant-design/icons';
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateBook, callFetchCategory, callUpdateBook } from "./../../../api/services";
import DebounceSelect from "../../share/DebounceSelect";
import { da } from "date-fns/locale";

const ModalBook = (props) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [optionsCategory, setOptionsCategory] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [isDeleteImage, setIsDeleteImage] = useState(false);

    const [form] = Form.useForm();

    useEffect(() => {
        const init = async () => {
            await fetchCategory();
            setIsDeleteImage(false);
        
            if (dataInit?.id) {
                if (dataInit.categories) {
                    const d = dataInit.categories;
                    const arr = d.map((item) => {
                       return {
                        label: item.name,
                        value: item.id + "",
                        key: item.id + ""
                    }
                    });
                    form.setFieldValue("categories", arr);
                }

                if (dataInit.image) {
                    setFileList([
                        {
                            uid: '-1',
                            name: 'image.png',
                            status: 'done',
                            url: dataInit.image,
                        }
                    ]);
                } else {
                    setFileList([]);
                }
            } else {
                setFileList([]);
            }
        }
        init();
    }, [dataInit]);

    const fetchCategory = async () => {
        let query = `page=0&size=100&sort=createdAt,desc`;

        const res = await callFetchCategory(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => {
                return {
                    label: item.name,
                    value: item.id + "",
                    key: item.id + ""
                }
            }) ?? [];
            setOptionsCategory(arr);
        }
    }

    const handleChangeUpload = ({ fileList }) => {
        if (fileList.length > 0 && fileList[0].originFileObj) {
            setIsDeleteImage(false);
        }
        
        setFileList(fileList);
    };

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpeg';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
        }
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('Hình ảnh phải nhỏ hơn 10MB!');
        }
        return isJpgOrPng && isLt10M;
    };

    const handleRemove = () => {
        setFileList([]);
        if (dataInit?.id && dataInit.image) {
            setIsDeleteImage(true);
        }
        return true;
    };

    const submitBook = async (valuesForm) => {
        const { name, description, publishedDate, bookFormat, bookSaleLink, language, author, status, categories } = valuesForm;
            if (dataInit?.id) {
                //update
                const book = {
                    name,
                    description,
                    publishedDate: publishedDate && typeof publishedDate === 'string' 
                    ? new Date(publishedDate.split('/').reverse().join('-')).toISOString().split('T')[0]
                    : publishedDate && publishedDate._d
                      ? new Date(publishedDate._d).toISOString().split('T')[0]
                      : publishedDate,
                    bookFormat,
                    bookSaleLink,
                    language,
                    author,
                    status,
                    categoryIds: Array.isArray(categories) 
                        ? categories.map(item => typeof item === 'string' ? item : item.value) 
                        : [categories]
                };
                
                if (fileList.length > 0 && fileList[0].originFileObj) {
                    book.image = fileList[0].originFileObj;
                }
                
                if (isDeleteImage) {
                    book.deleteImage = true;
                }
                const res = await callUpdateBook(book, dataInit.id);
                if (res && res.data) {
                    message.success("Cập nhật book thành công");
                    handleReset();
                    reloadTable();
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    })
                }
                    
            } else {
                //create
                const book = {
                    name,
                    description,
                    publishedDate: publishedDate && typeof publishedDate === 'string' 
                        ? new Date(publishedDate.split('/').reverse().join('-')).toISOString().split('T')[0]
                        : publishedDate && publishedDate._d
                          ? new Date(publishedDate._d).toISOString().split('T')[0]
                          : publishedDate,
                    bookFormat,
                    bookSaleLink,
                    language,
                    author,
                    status,
                    categoryIds: Array.isArray(categories) 
                        ? categories.map(item => typeof item === 'string' ? item : item.value) 
                        : [categories]
                };
                
                if (fileList.length > 0 && fileList[0].originFileObj) {
                    book.image = fileList[0].originFileObj;
                }
                
                const res = await callCreateBook(book);
                if (res && res.data) {
                    message.success("Thêm mới book thành công");
                    handleReset();
                    reloadTable();
                } else {
                    notification.error({
                        message: 'Có lỗi xảy ra',
                        description: res.message
                    })
                }
            }
        
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOptionsCategory([]);
        setFileList([]);
        setIsDeleteImage(false);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật Book" : "Tạo mới Book"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                    cancelText: "Hủy"
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitBook}
                initialValues={dataInit?.id ? {
                    ...dataInit,
                } : {}}

            >
                <Row gutter={16}>
                    <Col lg={8} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên sách"
                        />
                    </Col>
                    <Col lg={16} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Description"
                            name="description"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập mô tả"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            name="bookFormat"
                            label="Format"
                            placeholder="Nhập số trang"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống!' }]}
                        />
                    </Col>
                    <Col lg={12} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Sale Link"
                            name="bookSaleLink"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập sale link"
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Language"
                            name="language"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập ngôn ngữ"
                        />
                    </Col>
                    <Col lg={8} md={6} sm={24} xs={24}>
                        <ProFormText
                            label="Author"
                            name="author"
                            rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                            placeholder="Nhập tên tác giả"
                        />
                    </Col>
                    <Col lg={8} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            label="Trạng thái"
                            name="status"
                            valueEnum={{
                                NONE: 'NONE',
                                ACTIVE: 'ACTIVE',
                                INACTIVE: 'INACTIVE',
                                DELETED: 'DELETED'
                            }}
                            placeholder="Chọn trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                        />
                    </Col>

                    <Col lg={8} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="image"
                            label="Hình ảnh"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                    return e;
                                }
                                return e?.fileList;
                            }}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                beforeUpload={beforeUpload}
                                onChange={handleChangeUpload}
                                onRemove={handleRemove}
                                maxCount={1}
                                customRequest={({ file, onSuccess }) => {
                                    setTimeout(() => {
                                        onSuccess("ok");
                                    }, 0);
                                }}
                            >
                                {fileList.length >= 1 ? null : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Tải lên</div>
                                    </div>
                                )}
                            </Upload>
                        </ProForm.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={"Category"}
                            name="categories"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thể loại!' }]}

                        >
                            <Select
                                mode="multiple"
                                allowClear
                                suffixIcon={null}
                                style={{ width: '100%' }}
                                placeholder={
                                    <>
                                        <MonitorOutlined key="icon" /> Tìm theo thể loại...
                                    </>
                                }
                                optionLabelProp="label"
                                options={optionsCategory}
                            />
                        </Form.Item>
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDatePicker
                            label="Published Date"
                            name="publishedDate"
                            placeholder="Chọn ngày xuất bản"
                            fieldProps={{
                                format: 'DD/MM/YYYY',
                            }}
                        />
                    </Col>
                    
                    
                </Row>
            </ModalForm >
        </>
    )
}

export default ModalBook;
