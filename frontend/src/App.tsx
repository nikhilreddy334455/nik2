import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.js';
import { HomePage } from './pages/HomePage.js';
import { ReportLostPage } from './pages/ReportLostPage.js';
import { ReportFoundPage } from './pages/ReportFoundPage.js';
import { SearchPage } from './pages/SearchPage.js';
import { ItemDetailPage } from './pages/ItemDetailPage.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="report/lost" element={<ReportLostPage />} />
          <Route path="report/found" element={<ReportFoundPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="item/:id" element={<ItemDetailPage />} />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
