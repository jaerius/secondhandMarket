import { useState } from 'react';

export default function ProofSlider({ proof }: { proof: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const proofArray = Object.entries(proof).map(([key, value]) => ({
    key,
    value: JSON.stringify(value), // proof가 객체라면 문자열로 변환
  }));

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % proofArray.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + proofArray.length) % proofArray.length,
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center">
        <button onClick={prevSlide} className="p-2">
          &lt;
        </button>
        <div
          className="w-64 p-4 border text-center overflow-x-auto whitespace-nowrap text-sm text-black bg-white rounded shadow-md"
          style={{ maxWidth: '250px' }} // 텍스트가 박스를 넘길 때 스크롤 가능
        >
          <strong>{proofArray[currentIndex].key}</strong>:{' '}
          {proofArray[currentIndex].value}
        </div>
        <button onClick={nextSlide} className="p-2">
          &gt;
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {currentIndex + 1} / {proofArray.length}
      </p>
    </div>
  );
}
