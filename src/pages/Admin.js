import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useMySQLAuth } from '../context/MySQLAuthContext';

const Admin = () => {
    const [image, setImage] = useState(null);
    const [bookDetails, setBookDetails] = useState({ title: "", description: "", image: "", author: "", price: "" });
    const { currentUser } = useMySQLAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!bookDetails.title || !bookDetails.price) return;
            
            const bookData = {
                ...bookDetails,
                createdAt: new Date().toISOString(),
                createdBy: user?.uid || 'admin'
            };
            
            await addDoc(collection(db, "books"), bookData);
            setBookDetails({ title: "", description: "", image: "", author: "", price: "" });
            setImage(null);
            alert('Book added successfully!');
        } catch (err) {
            console.log('error creating book:', err);
            alert('Error creating book. Please try again.');
        }
    }

    const handleImageUpload = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const fileExtension = file.name.split(".").pop();
            const fileName = `${uuidv4()}.${fileExtension}`;
            const storageRef = ref(storage, `book-images/${fileName}`);
            
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);
            
            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            setImage(downloadURL);
            setBookDetails({ ...bookDetails, image: downloadURL });
        } catch (err) {
            console.log(err);
            alert('Error uploading image. Please try again.');
        }
    }

    // Check if user is admin (you can implement your own admin check logic)
          if (!currentUser) {
        return (
            <div className="admin-wrapper">
                <div className="form-header">
                    <h3>Admin Access Required</h3>
                    <p>Please log in to access the admin panel.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="admin-wrapper">
            <section>
                <header className="form-header">
                    <h3>Add New Book</h3>
                    <p>Welcome, {user.email}</p>
                </header>
                <form className="form-wrapper" onSubmit={handleSubmit}>
                    <div className="form-image">
                        {image ? (
                            <div>
                                <img className="image-preview" src={image} alt="Preview" />
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setImage(null);
                                        setBookDetails({ ...bookDetails, image: "" });
                                    }}
                                    className="btn-secondary"
                                >
                                    Remove Image
                                </button>
                            </div>
                        ) : (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e)}
                            />
                        )}
                    </div>
                    <div className="form-fields">
                        <div className="title-form">
                            <p><label htmlFor="title">Title</label></p>
                            <p><input
                                name="title"
                                type="text"
                                placeholder="Type the title"
                                value={bookDetails.title}
                                onChange={(e) => setBookDetails({ ...bookDetails, title: e.target.value })}
                                required
                            /></p>
                        </div>
                        <div className="description-form">
                            <p><label htmlFor="description">Description</label></p>
                            <p><textarea
                                name="description"
                                rows="8"
                                placeholder="Type the description of the book"
                                value={bookDetails.description}
                                onChange={(e) => setBookDetails({ ...bookDetails, description: e.target.value })}
                                required
                            /></p>
                        </div>
                        <div className="author-form">
                            <p><label htmlFor="author">Author</label></p>
                            <p><input
                                name="author"
                                type="text"
                                placeholder="Type the author's name"
                                value={bookDetails.author}
                                onChange={(e) => setBookDetails({ ...bookDetails, author: e.target.value })}
                                required
                            /></p>
                        </div>
                        <div className="price-form">
                            <p><label htmlFor="price">Price ($)</label>
                                <input
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="What is the Price of the book (USD)"
                                    value={bookDetails.price}
                                    onChange={(e) => setBookDetails({ ...bookDetails, price: e.target.value })}
                                    required
                                /></p>
                        </div>
                        <div className="featured-form">
                            <p><label>Featured?</label>
                                <input type="checkbox"
                                    className="featured-checkbox"
                                    checked={bookDetails.featured || false}
                                    onChange={() => setBookDetails({ ...bookDetails, featured: !bookDetails.featured })}
                                />
                            </p>
                        </div>
                        <div className="submit-form">
                            <button className="btn" type="submit">Submit</button>
                        </div>
                    </div>
                </form>
            </section>
        </section>
    )
}

export default Admin
