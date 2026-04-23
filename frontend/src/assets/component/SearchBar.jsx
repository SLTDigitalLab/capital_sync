import React from 'react';

const SearchBar = ({ searchFilters, setSearchFilters, categories }) => {

    const handleFilterChange = (field, value) => {
        setSearchFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setSearchFilters({ category: '', date: '', type: '', price: '' });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

                {/* Category */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">Category:</label>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                        value={searchFilters.category}
                        onChange={e => handleFilterChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Date */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">Date:</label>
                    <input
                        type="date"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={searchFilters.date}
                        onChange={e => handleFilterChange('date', e.target.value)}
                    />
                </div>

                {/* Type */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">Type:</label>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                        value={searchFilters.type}
                        onChange={e => handleFilterChange('type', e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>

                {/* Price */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">Amount:</label>
                    <input
                        type="number"
                        placeholder="Enter amount"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={searchFilters.price}
                        onChange={e => handleFilterChange('price', e.target.value)}
                    />
                </div>

                {/* Clear */}
                <div>
                    <button
                        className="w-full px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;