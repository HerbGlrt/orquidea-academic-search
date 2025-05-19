
import React from 'react';
import SearchBar from '../components/SearchBar';
import HotPapers from '../components/HotPapers';
import MainLayout from '../components/layout/MainLayout';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="w-full max-w-4xl flex flex-col items-center justify-center py-8 mx-auto">
        <SearchBar />
      </div>
      <HotPapers />
    </MainLayout>
  );
};

export default HomePage;
