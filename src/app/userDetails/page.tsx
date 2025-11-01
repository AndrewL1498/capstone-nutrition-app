"use client";

import React, {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { healthLabels, allergyLabels, cuisineTypes, dishTypes, mealTypes } from "@/foodCategories/foodCategories"; 

connect(); // Establishes a connection to the database using the connect function from dbConfig

export default function UserDetailsPage() {
    const router = useRouter();



}

