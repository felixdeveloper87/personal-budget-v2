package com.example.budget.merchant;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MerchantBrandCatalogTest {

    @Test
    void resolvesAmbiguousAliasesToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("M&S Food Hall London"))
                .contains(new MerchantBrand("Marks & Spencer", "marksandspencer.com"));
        assertThat(MerchantBrandCatalog.resolve("PEPE'S PIRI PIRI #42"))
                .contains(new MerchantBrand("Pepe's Piri Piri", "pepes.co.uk"));
    }

    @Test
    void prefersTheLongestMatchingAlias() {
        assertThat(MerchantBrandCatalog.resolve("Uber Eats London"))
                .contains(new MerchantBrand("Uber Eats", "ubereats.com"));
    }

    @Test
    void doesNotMatchAliasesInsideOtherWords() {
        assertThat(MerchantBrandCatalog.resolve("Subway"))
                .contains(new MerchantBrand("Subway", "subway.com"));
        assertThat(MerchantBrandCatalog.resolve("Subwayland"))
                .isEmpty();
    }
}
