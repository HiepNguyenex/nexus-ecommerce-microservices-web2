package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table (name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product implements java.io.Serializable {
    private static final long serialVersionUID = 1L;


    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "product_name")
    @NotNull
    private String productName;

    @Column (name = "price")
    @NotNull
    private BigDecimal price;

    @Column (name = "discription")
    private String discription;

    @Column (name = "category")
    @NotNull
    private String category;

    @Column (name = "availability")
    @NotNull
    private int availability;

    @Lob
    @Column (name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "top_notes")
    private String topNotes;

    @Column(name = "middle_notes")
    private String middleNotes;

    @Column(name = "base_notes")
    private String baseNotes;

    @Column(name = "olfactory_family")
    private String olfactoryFamily;

    @Column(name = "concentration")
    private String concentration;

    @Column(name = "longevity")
    private String longevity;

    @Column(name = "sillage")
    private String sillage;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductVariant> variants = new ArrayList<>();

	public Product() {

	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getDiscription() {
		return discription;
	}

	public void setDiscription(String discription) {
		this.discription = discription;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public int getAvailability() {
		return availability;
	}

	public void setAvailability(int availability) {
		this.availability = availability;
	} 

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getTopNotes() {
		return topNotes;
	}

	public void setTopNotes(String topNotes) {
		this.topNotes = topNotes;
	}

	public String getMiddleNotes() {
		return middleNotes;
	}

	public void setMiddleNotes(String middleNotes) {
		this.middleNotes = middleNotes;
	}

	public String getBaseNotes() {
		return baseNotes;
	}

	public void setBaseNotes(String baseNotes) {
		this.baseNotes = baseNotes;
	}

	public String getOlfactoryFamily() {
		return olfactoryFamily;
	}

	public void setOlfactoryFamily(String olfactoryFamily) {
		this.olfactoryFamily = olfactoryFamily;
	}

	public String getConcentration() {
		return concentration;
	}

	public void setConcentration(String concentration) {
		this.concentration = concentration;
	}

	public String getLongevity() {
		return longevity;
	}

	public void setLongevity(String longevity) {
		this.longevity = longevity;
	}

	public String getSillage() {
		return sillage;
	}

	public void setSillage(String sillage) {
		this.sillage = sillage;
	}

	public List<ProductVariant> getVariants() {
		return variants;
	}

	public void setVariants(List<ProductVariant> variants) {
		this.variants = variants;
	}
}
