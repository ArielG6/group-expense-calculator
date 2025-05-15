
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

interface Person {
  name: string;
  amount: number;
  result?: number;
}

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 }
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [results, setResults] = useState<Person[]>([]);

  const calculateSplit = () => {
    const total = people.reduce((sum, person) => sum + person.amount, 0);
    const split = total / people.length;

    const updatedResults = people.map(person => ({
      ...person,
      result: person.amount - split
    }));

    setResults(updatedResults);
  };

  useEffect(() => {
    calculateSplit();
  }, [people]);

  const handleInputChange = (index: number, field: keyof Person, value: string | number) => {
    const newPeople = [...people];
    
    if (field === 'amount') {
      const numValue = Number(value);
      newPeople[index] = { 
        ...newPeople[index], 
        [field]: numValue >= 0 ? numValue : 0 
      };
    } else {
      newPeople[index] = { ...newPeople[index], [field]: value };
    }
    
    setPeople(newPeople);
  };

  const addPerson = () => {
    setPeople([...people, { name: '', amount: 0 }]);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Group Expense Report', 10, 10);
    people.forEach((person, index) => {
      doc.text(`${person.name}: $${person.amount.toFixed(2)} - ${results[index]?.result! < 0 
        ? `has to pay $${Math.abs(results[index].result!).toFixed(2)}` 
        : `has to receive $${results[index].result!.toFixed(2)}`}`, 10, 20 + (index * 10));
    });
    doc.text(`Total: $${people.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`, 10, 20 + (people.length * 10));
    doc.text(`Each should pay: $${(people.reduce((sum, p) => sum + p.amount, 0) / people.length).toFixed(2)}`, 10, 30 + (people.length * 10));
    doc.save('group-expense-report.pdf');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`px-4 py-2 rounded-md ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <h1 className="text-3xl font-bold">Group Expense Calculator</h1>
        <div className="w-20"></div> {/* Spacer */}
      </div>
      
      <div className={`w-full max-w-2xl rounded-lg shadow-md p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="space-y-4">
          {people.map((person, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => removePerson(index)}
                className={`px-2 py-1 rounded-md ${
                  isDarkMode 
                    ? 'bg-red-700 hover:bg-red-600' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white`}
                disabled={people.length <= 1}
              >
                🗑️
              </button>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder={`Person ${index + 1} name`}
                  value={person.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  placeholder="Amount contributed"
                  value={person.amount || ''}
                  onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                />
              </div>
              <div className="flex-1 w-full">
                {results[index]?.result !== undefined && (
                  <p className={`text-sm ${results[index].result! < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {results[index].result! < 0 
                      ? `has to pay $${Math.abs(results[index].result!).toFixed(2)}` 
                      : `has to receive $${results[index].result!.toFixed(2)}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addPerson}
          className={`mt-6 w-full px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-blue-700 hover:bg-blue-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          + Add Person
        </button>

        <button
          onClick={downloadPDF}
          className={`mt-2 w-full px-4 py-2 rounded-md ${
            isDarkMode 
              ? 'bg-green-700 hover:bg-green-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          Download PDF
        </button>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">
            Total: ${people.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
          </p>
          <p className="text-sm">
            Each should pay: ${(people.reduce((sum, p) => sum + p.amount, 0) / people.length).toFixed(2)}
          </p>
        </div>
      </div>

      <script src="https://cdn.tailwindcss.com"></script>
    </div>
  );
};

export default App;
