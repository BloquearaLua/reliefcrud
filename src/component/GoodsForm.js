import React, { forwardRef,useState,useEffect } from 'react'
import { Form, Input, Select, Radio } from 'antd';
import './goodForm.css'
import axios from 'axios';

const { Option } = Select;
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    // labelAlign: "right",
    // layout: "horizontal"
};

const GoodsForm = forwardRef((props,ref) => {
    // const [form] = Form.useForm();
    const [category, setCategory] = useState([]);
    const { isdisable } = props;
    useEffect(() => {
        axios.get("http://localhost:5000/keepType").then(response => {
            setCategory(response.data);
        })
    }, []);

    return (
        <Form {...layout} ref={ref} className="addForm" >
            <Form.Item name="name" label="物资品名" rules={[{ required: true, message: '请选择物资品名' }]}>
                <Input disabled={isdisable}/>
            </Form.Item>
            <Form.Item name="category" label="物资类别" >
                <Input disabled={isdisable}/>
            </Form.Item>
            <Form.Item name="unit" label="计量单位">
                <Input disabled={isdisable}/>
            </Form.Item>
            <Form.Item name="specs" label="规格/型号" rules={[{ required: true, message: "请输入规格/型号" }]} >
                <Input placeholder="请输入规格/型号" />
            </Form.Item>
             <Form.Item name="validId" label="是否有效" rules={[{ required: true, message: '请选择是否有效' }]}>
                <Radio.Group>
                    <Radio value="2">是</Radio>
                    <Radio value="3">否</Radio>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                name="keptTypeId"
                label="储备类型"
                // hasFeedback
                rules={[{ required: true, message: '请选择储备类型' }]}
            >
                <Select placeholder="请选择储备类型">
                    {
                        category.map(item => <Option value={item.value} key={item.id}>{item.type}</Option>)
                    }
                </Select>
            </Form.Item>
            {
                isdisable ?
                    <Form.Item name='id' label="排序" rules={[{ required: true }]} >
                        <Input disabled={isdisable}/>
                    </Form.Item>
                    : <></>
            }
            <Form.Item name="weight" label="重量">
                <Input placeholder="请输入重量"/>
            </Form.Item>
            <Form.Item name="cube" label="体积">
                <Input placeholder="请输入体积"/>
            </Form.Item>
            {
                isdisable ?
                    <Form.Item name='date' label="创建时间" >
                        <Input disabled={isdisable}/>
                    </Form.Item>
                    : <></>
            }
            <Form.Item name='introduction' label="物资用途">
                <Input.TextArea placeholder="请输入物资用途"/>
            </Form.Item>
            
        </Form>
        )
}) 

export default GoodsForm;