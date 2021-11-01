import React, { useState } from "react";
import './App.css';
import DraggableListHoc from './components/DraggableListHoc';

export default function App() {
  const [list, setList] = useState([
    { id: 1, name: "Steinway", image: 'https://www.purdue.edu/convocations/wp-content/uploads/2012/08/Steinway-D.jpeg' },
    { id: 2, name: "Bosendorfer", image: 'https://www.yamahamusiclondon.com/sites/ymlv5.93/productimages/big/BOSENDORFER-BEETHOVN_f.jpg' },
    { id: 3, name: "Yamaha", image: 'https://www.yamaha.com/us/pianos/images/C6X__1001-4b50eded.jpg' },
    { id: 4, name: "Kawai", image: 'https://www.schmittmusic.com/wp-content/uploads/2017/09/GE-1B.jpg' },
    { id: 5, name: "Young Chang", image: 'https://www.chuppspianos.com/wp-content/uploads/2018/03/Young-Chang-Model-G-200-Parlor-Grand-Piano-Polished-Ebony-For-Sale-1024x683.jpg' },
    { id: 6, name: "Boston", image: 'https://carusopianos.com/images/stories/virtuemart/product/boston_gp193_152533_th__1544207040_853.jpg' }]
  );

  return (
    <div className="App">
      <DraggableListHoc
        axis="x"
        onDragEnd={setList}
        listData={list}
      >
        {list.map((item, i) => {
          return (
            <div key={item.id} style={{ margin: '.5rem' }}>
              <h1>{item.name}</h1>
              <div className="img" style={{
                width: 120,
                height: 120,
                background: `url(${item.image})`,
                backgroundSize: 'cover',
              }} />
            </div>
          )
        })}
      </DraggableListHoc>
      <button onClick={() => console.log(list.map(p => p.name))}>
        Log those pianos
      </button>
    </div>
  );
}
