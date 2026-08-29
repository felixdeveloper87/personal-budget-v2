package com.example.budget.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HouseholdMemberTest {
    @Test
    void displayNameFallsBackToTheUserNameForExistingMemberships() {
        User user = new User();
        user.setName("Original name");
        HouseholdMember member = new HouseholdMember();
        member.setUser(user);

        assertThat(member.getDisplayName()).isEqualTo("Original name");
    }

    @Test
    void householdDisplayNameDoesNotChangeTheUserProfileName() {
        User user = new User();
        user.setName("Original name");
        HouseholdMember member = new HouseholdMember();
        member.setUser(user);
        member.setDisplayName("Corrected name");

        assertThat(member.getDisplayName()).isEqualTo("Corrected name");
        assertThat(user.getName()).isEqualTo("Original name");
    }
}
