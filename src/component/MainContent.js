import React,{useEffect,useState,useRef} from 'react';
import { Layout, Input, Select,Button,Table,Alert,Modal,Popconfirm, message } from 'antd';
import axios from 'axios';
import GoodsForm from './GoodsForm';
import { v4 as uuidv4 } from 'uuid';

const { Content } = Layout;
const { Option } = Select;
export default function MainContent(props) {
    // console.log(props);
    const { clickList,handleisUpdate } = props;
    const [dataSource, setDataSource] = useState([]);
    const [valid, setValid] = useState([]);
    const [selectedList, setSelectedList] = useState([]);
    const [selectedId, setSelectedId] = useState([]);
    const [category, setCategory] = useState({});
    const [currentItem, setCurrentItem] = useState([]);
    const [rowkeys, setRowKeys] = useState([]);
    const [categoryKey, setCategoryId] = useState({});
    const [isAddVisible, setIsAddVisible] = useState(false);
    const [isUpdateVisible, setisUpdateVisible] = useState(false);
    const [curValid, setcurValid] = useState(1);
    const [selected, setSelected] = useState(0);
    const [isdisable, setisDisable] = useState(false);

    const scale = useRef();
    const addFormRef = useRef();
    const updateFormRef = useRef();

    // 点击左栏，出现相关数据
    useEffect(() => {
        setDataSource(clickList);
        scale.current.state.value = '';
        setcurValid(1);
    }, [clickList]);

    // 获取是否有效表，和分类表
    useEffect(() => {
        axios.all([axios.get("http://localhost:5000/ifvalid"),axios.get("http://localhost:5000/category")]).then(response => {
            setValid(response[0].data);
            let categoryTmp1 = {};
            let categoryTmp2 = {};
            response[1].data.forEach(item => {
                categoryTmp1[item.name] = item.id;
                categoryTmp2[item.id] = item.key;
            })
            setCategory(categoryTmp1);
            setCategoryId(categoryTmp2);
        })
    }, [])

    // 点击查询
    const handleSearch = () => {
        let value1 = scale.current.state.value;
        value1 = value1 ? value1.trim() : '';
        // 设置为全部时,规格/型号为设置
        if (curValid === 1 && value1 === '') {
            setDataSource(clickList);
            return;
        }
        let content = '';
        setDataSource(clickList.filter(item => {
            // 未输入规格/型号
            content = item.specs;
            // 搜索全部时的curValid是不等的
            return ((curValid === 1 || valid[item.validId - 1].value === curValid) && content.match(value1));
        }));
    };
    
    // 点击重置
    const handleReset = () => {
        scale.current.state.value = '';
        setcurValid(1);
        handleSearch();
    }

    // 删除
    const handleDelete = () => {
        selectedList.forEach(item => {
            // console.log(item);
            axios.delete(`http://localhost:5000/children/${item.id}`);
        });
        setDataSource(dataSource.filter(one => !selectedId.includes(one.id)));
        setSelected(0);
    };

    // 点击清空
    const handleClean = () => {
        setRowKeys([]);
        setSelected(0);
    };

    // 点击新增
    const handleAdd = () => {
        setIsAddVisible(true);
    };

    // 新增数据处理
    const addForm = () => {
        setisDisable(false);
        addFormRef.current.validateFields().then(value => {
            // console.log(value);
            setIsAddVisible(false);
            const categoryId = category[value.category];
            // 处理数据
            for (let i in value) {
                if (!value[i]) {
                    value[i] = '';
                }
            }
            value.date = (new Date()).toLocaleDateString();
            value.grade = 3;
            value.categoryId = category[value.category];
            // 如果children里没这个分类，就添加
            let key;
            if (!categoryId) {
                key = `/relief/${uuidv4()}`;
                // 给category添加分类
                axios.post("http://localhost:5000/category", { name: value.category, typeId: 1, key }).then(response => {
                    const { id } = response.data;
                    const cateId = value.categoryId;
                    category[cateId] = id;      // 设置 类别：id对象
                    setCategory(category);
                })
                value.key = `${key}/${uuidv4()}`;
            } else {
                value.key = `/relief/${categoryKey[categoryId]}/${uuidv4()}`;
            }
            axios.post("http://localhost:5000/children", value).then(response => {
                setDataSource([response.data, ...dataSource]);
            })
            handleisUpdate(true);
        });
        handleisUpdate(false);
    }

    // 编辑数据处理
    const updateForm = () => {
        updateFormRef.current.validateFields().then(value => {
            setisUpdateVisible(false);
            setDataSource(dataSource.map(item => item.id === currentItem.id ? ({ ...item, ...value}) : item));
            axios.patch(`http://localhost:5000/children/${currentItem.id}`, value);
        }).catch(() => {
            alert('出错了...');
        })
    }

    // 点击编辑
    const handleUpdate = (item) => {
        setTimeout(() => {
            setisUpdateVisible(true);
            setisDisable(true);
            updateFormRef.current.setFieldsValue(item);
            setCurrentItem(item);
        },0)
    }

    // 多选相关参数
    const rowSelection = {
        onSelect: (record, selected, selectedRows) => {
            setSelectedList(selectedRows);
            setSelected(selectedRows.length);
        },
        onSelectAll: (selected, selectedRows) => {
        },
        onChange: (selectedRowKeys,selectedRows) => {
            setSelected(selectedRowKeys.length);
            setSelectedId(selectedRowKeys);
            setRowKeys(selectedRowKeys);
            setSelectedList(selectedRows);
        },
        selectedRowKeys: rowkeys
    };

    // 删除弹出框确认
    function confirm() {
        if (selectedId.length === 0) {
            message.error('请选择要删除的选项');
            return;
        }
        handleDelete();
        message.success('删除成功');
    }

    // 删除弹出框取消
    function cancel() {
        if (selectedId.length === 0) {
            message.error('请选择要删除的选项');
            return;
        }
        message.error('删除失败');
    }

    // 表格数据
    const columns = [
        {
            title: '序号',
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: '物资品名',
            dataIndex: 'name'
        },
        {
            title: '规格/型号',
            dataIndex:'specs'
        },
        {
            title: '储备类型',
            dataIndex: 'keptTypeId',
            render: (keptTypeId => {
                return keptTypeId==='1' ? "自储备" : "企业储备"  
            })
        },
        {
            title: '是否有效',
            dataIndex: 'validId',
            render: (valid => {
                if (valid === '2') {
                    return "是";
                }else if(valid ==='3'){
                    return "否"
                }
            })
        },
        {
            title: '排序',
            dataIndex:'id'
        },
        {
            title: '操作',
            render: (item) => {
                return <Button type="primary" onClick={()=>handleUpdate(item)}>编辑</Button>;
            }
        },
    ];    

    
    
    return (
        <div>
            <Content style={{margin: '20px 12px 0',borderTop:"solid 1px rgb(228, 228, 228)",borderLeft:"solid 1px rgb(228, 228, 228)" }}>
                <div className="site-layout-background" style={{ padding: 24, minHeight: "100%" }}>
                    <div style={{width:"100%"}}>
                        规格/型号：<Input style={{width:"30%",marginRight:"15%"}} placeholder="请输入规格/型号" ref={scale} />
                        是否有效：<Select
                            showSearch
                            style={{ width: "30%" }}
                            placeholder="请选择是否有效"
                            optionFilterProp="children"
                            onSelect={(value)=>setcurValid(value)}
                            value={curValid}
                        >
                            {
                                valid.map(
                                    item => {
                                        return <Option value={item.value} key={item.id}>{item.valid}</Option>
                                    })
                            }
                        </Select>
                        <div style={{margin:"20px 0"}}>
                            <Button type="primary" style={{marginRight:10}} onClick={handleAdd}>新增</Button>
                            <Modal title="新增物资" visible={isAddVisible} onOk={addForm} onCancel={() => setIsAddVisible(false)
                            } width={'70%'} okText="保存"
                                cancelText="关闭" destroyOnClose = { true }>
                                <GoodsForm ref={addFormRef}/>
                            </Modal>

                            <Modal title="修改物资" visible={isUpdateVisible} onOk={updateForm} onCancel={()=>setisUpdateVisible(false)} width={'70%'} okText="保存"
                                cancelText="关闭">
                                <GoodsForm ref={updateFormRef} isdisable={ isdisable }/>
                            </Modal>

                            
                            <Popconfirm
                                title="Are you sure to delete this task?"
                                onConfirm={confirm}
                                onCancel={cancel}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger>删除</Button>
                            </Popconfirm>
                            <Button type="primary" style={{marginLeft:'38%',marginRight:10}} onClick={handleSearch}>查询</Button>
                            <Button onClick={handleReset}>重置</Button>
                        </div>

                        <Alert message={`已选择 ${selected} 项`} type="info" showIcon action={
                            <Button size="small" type="text" style={{ color: '#1890ff',marginRight:650 }} onClick={handleClean}>
                                清空
                            </Button>
                            }/>
                        <Table
                            rowSelection={{
                                type: "checkbox",
                                ...rowSelection,
                            }}
                            columns={columns}
                            dataSource={dataSource}
                            rowKey={item => item.id}
                            pagination = {{showQuickJumper:true,pageSize:6,pageSizeOptions:[10,20,50,100],showSizeChanger:true}}
                        />
                    </div>
                </div>
            </Content>
        </div>
    )
}
