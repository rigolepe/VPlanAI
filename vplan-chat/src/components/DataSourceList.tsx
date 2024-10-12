import React, { useState, useEffect } from 'react';
import { DataSource } from '../types/dataSource';
import styles from './DataSourceList.module.css';

const DataSourceList: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [svgDataSource, setSvgDataSource] = useState<string | null>(null);

  useEffect(() => {
    // Load data sources from local storage
    // This is a placeholder for the actual implementation
    const loadedDataSources: DataSource[] = [
      { id: '1', name: 'Data Source 1', includeInContext: true, data: []  },
      { id: '2', name: 'Data Source 2', includeInContext: false, data: []  },
      // Add more data sources as needed
    ];
    setDataSources(loadedDataSources);
  }, []);

  const toggleIncludeInContext = (id: string) => {
    setDataSources(dataSources.map(ds =>
      ds.id === id ? { ...ds, includeInContext: !ds.includeInContext } : ds
    ));
  };

  const handleSvgDataSourceSelect = (id: string) => {
    setSvgDataSource(id === svgDataSource ? null : id);
  };

  return (
    <div className={styles.dataSourceList}>
      <h3>Data Sources</h3>
      {dataSources.map(ds => (
        <div key={ds.id} className={styles.dataSourceItem}>
          <span>{ds.name}</span>
          <label>
            <input
              type="checkbox"
              checked={ds.includeInContext}
              onChange={() => toggleIncludeInContext(ds.id)}
            />
            Include in Context
          </label>
          <label>
            <input
              type="radio"
              name="svgDataSource"
              checked={ds.id === svgDataSource}
              onChange={() => handleSvgDataSourceSelect(ds.id)}
            />
            Use for SVG
          </label>
        </div>
      ))}
      <button onClick={() => {/* Open modal to add new data source */}}>Add Data Source</button>
    </div>
  );
};

export default DataSourceList;