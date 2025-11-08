import { formatDate } from "./src/utils/fileGenerator.js";

// Test with the date format from the API response
const testDate = "11-01-25";
console.log("Formatted date:", formatDate(testDate));

// Test with a standard date format
const standardDate = "2025-11-01";
console.log("Standard date:", formatDate(standardDate));
