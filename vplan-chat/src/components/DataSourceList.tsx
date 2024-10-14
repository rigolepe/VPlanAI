import React, { useState, useEffect, useRef } from 'react';
import styles from './DataSourceList.module.css';

interface DataSourcesProps {
  changeData:  (data: any) => void
  jsonData: any
}

const DataSourceList: React.FC<DataSourcesProps> = (props: DataSourcesProps) => {
  const [svgDataSource, setSvgDataSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
  }, []);

  const handleDownload = () => {
    console.log("Downloading data")
    // Convert JSON data to a string
    const jsonString = JSON.stringify(props.jsonData, null, 2);

    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a temporary <a> element
    const link = document.createElement('a');

    // Create a URL for the blob and set it as the href attribute
    link.href = URL.createObjectURL(blob);

    // Set the download attribute to the desired file name
    link.download = 'data.json';

    // Append the <a> element to the document body
    document.body.appendChild(link);

    // Programmatically click the <a> to trigger the download
    link.click();

    // Clean up and remove the <a> element
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.files) {
      const file = event.target.files[0];
      if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if(e && e.target && e.target.result){
              const data = JSON.parse(e.target.result as any);
              props.changeData(data);
            }
          } catch (err) {
            alert('Error parsing JSON file');
            props.changeData(null);
          }
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a valid JSON file');
        props.changeData(null);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.dataSourceList}>
      <h3>Data Source</h3>
      {/* <span>{JSON.stringify(props.jsonData)}</span> */}
      <div className={styles.dataSourceListButtons}>
        <button onClick={() => handleDownload()}>Download JSON</button>
        <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={handleButtonClick}>Upload JSON</button>
      </div>
    </div>
  );
};

export default DataSourceList;