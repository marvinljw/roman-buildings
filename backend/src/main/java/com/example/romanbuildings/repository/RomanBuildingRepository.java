package com.example.romanbuildings.repository;

import com.example.romanbuildings.model.RomanBuilding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RomanBuildingRepository extends JpaRepository<RomanBuilding, Long> {
    // You can add custom query methods here if needed
}