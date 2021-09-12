import React,{ useEffect,useState } from 'react';
import { Layout, Input, Space,Tree } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Sider } = Layout;
const { Search } = Input;
export default function SideMenu(props) {
    // console.log(props);
    const { handleclick,isUpdate } = props;
    const [menuList,setmenuList] = useState([]);
    const [clickList, setClickList] = useState([]);
    // const [keepList, setKeepList] = useState([]);

    const onSelect = (selectedKeys) => {
        // console.log(selectedKeys);
        if (selectedKeys[0] === "/") {
            let data = transData(menuList);
            setClickList(data);
            return;
        }
        // 获取层级
        const grade = selectedKeys[0] ? selectedKeys[0].split('/').length-1 : -1;
        if (grade === 1) {
            axios.get(`http://localhost:5000/types?key=${selectedKeys[0]}`). then(response => {
                const { id } = response.data[0];
                let data = transData(menuList[id - 1].children);
                setClickList(data);
            })
        } else if (grade === 2) {
            axios.get(`http://localhost:5000/category?key=${selectedKeys[0]}&_embed=children`). then(response => {
                // console.log(response.data[0].children);
                let data = transData(response.data[0].children);
                setClickList(data);
            })
        } else if (grade === 3) {
            axios.get(`http://localhost:5000/children?key=${selectedKeys[0]}`). then(response => {
                // console.log(response.data[0]);
                let data = response.data;
                setClickList(data);
            })
        }
        
    }
    let listData = [];
    const transData= (menuList) => {
        if (menuList === undefined) return;
        menuList.forEach(item => {
            if (item.children) {
                transData(item.children);
            } else {
                listData.push(item);
            }
        })
        return listData;
    }
    

    const renderSide = (menuList) => {
        if (menuList === undefined) return;
        let data = [];
        menuList.forEach(item => {
            let obj = {};
            obj = {
                title: item.name,
                key: item.key,
                children: renderSide(item.children)
            };
            data.push(obj);
        })
        return data;
    }

    const treeData = [
        {
            title: "",
            key: "/",
            icon: <HomeOutlined />,
            children: renderSide(menuList)
        }
    ];

    const expandedKeys = ['/'];
    
    useEffect(() => {
        axios.get('http://localhost:5000/children').then(response => {
            setClickList(response.data);
        })
    },[])
    
    useEffect(() => {
        axios.all([axios.get("http://localhost:5000/types"), axios.get("http://localhost:5000/category?_embed=children")]).then((response) => {
            const data1 = response[0].data;
            const data2 = response[1].data;
            let data = [...data1];
            for (let i = 0, len1 = data1.length; i < len1; i++){
                data[i].children = [];
                for (let j = 0, len2 = data2.length; j < len2; j++) {
                    if (data1[i].id === data2[j].typeId) {
                        data[i].children.push(data2[j]);
                    }
                }
            }
            setmenuList(data);
            setClickList(transData(data));
        });
    },[isUpdate])
    return (
        <div>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                width="300"
                theme="light"
                style={{height:"100%",padding:"20px"}}
                handleclick={setTimeout(()=>handleclick(clickList),0)}
            >
                <Space direction="vertical" style={{paddingBottom:"10px"}}>
                    <Search style={{ width: 260 }} />
                </Space>
                <Tree
                    showLine={true}
                    showIcon={true}
                    onSelect={onSelect}
                    treeData={treeData}
                    defaultExpandedKeys={expandedKeys}
                />
            </Sider>
        </div>
    )
}
