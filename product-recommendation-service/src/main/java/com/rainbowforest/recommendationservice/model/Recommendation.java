package com.rainbowforest.recommendationservice.model;

import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Table (name = "recommendation")
public class Recommendation {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Column (name = "rating")
    private int rating;

    @ManyToOne
    @JoinColumn (name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn (name = "user_id")
    private User user;

    @Column (name = "comment", length = 1000)
    private String comment;
    
    public Recommendation() {
	
	}

	public Recommendation(int rating, Product product, User user) {
        this.rating = rating;
        this.product = product;
        this.user = user;
    }

	public Recommendation(int rating, Product product, User user, String comment) {
        this.rating = rating;
        this.product = product;
        this.user = user;
        this.comment = comment;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
