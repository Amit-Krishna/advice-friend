// File: src/app/admin/page.js

"use client";
import { useState } from 'react';

export default function AdminPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        category: 'Tool', // Default category
        image_url: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('Submitting...');
        try {
            const response = await fetch('/api/trends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Submission failed');
            setMessage('Successfully added new trend!');
            // Clear the form
            setFormData({ title: '', description: '', link: '', category: 'Tool', image_url: '' });
        } catch (error) {
            setMessage('Error: Could not add trend.');
            console.error(error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Add New AI Trend</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" required className="w-full p-2 border rounded" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full p-2 border rounded" />
                <input name="link" type="url" value={formData.link} onChange={handleChange} placeholder="https://example.com" required className="w-full p-2 border rounded" />
                <input name="image_url" type="url" value={formData.image_url} onChange={handleChange} placeholder="Image URL (Optional)" className="w-full p-2 border rounded" />
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="New Model">New Model</option>
                    <option value="Tool">Tool</option>
                    <option value="News">News</option>
                    <option value="Library">Library</option>
                </select>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">Add Trend</button>
            </form>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
}