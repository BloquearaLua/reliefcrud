import { Layout } from 'antd';
import { useState } from 'react';
import '../node_modules/antd/dist/antd.css';
import './App.css';
import SideMenu from './component/SideMenu';
import MainContent from './component/MainContent';

function App() {
  // const [key, setKey] = useState([]);
  const [clickList, setclickList] = useState([]);
  const [isUpdate, setisUpdate] = useState(false);
  const handleclick = (_clickList) => {
    setclickList(_clickList);
  }
  const handleisUpdate = (flag) => {
    setisUpdate(flag);
  }
  return (
    <Layout style={{minHeight:"100%"}} >
      <SideMenu handleclick={handleclick} isUpdate={isUpdate}/>
        <Layout>
        <MainContent clickList={clickList} handleisUpdate={handleisUpdate}/>
        </Layout>
    </Layout>
  );
}

export default App;
