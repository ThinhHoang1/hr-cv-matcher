
import dotenv from 'dotenv';
dotenv.config();
import { CandidateService } from './src/services/candidate.service';

async function testSearch() {
    console.log('--- Testing AI Search Logic ---');
    try {
        console.log('Querying: "developer"');
        const results = await CandidateService.search('developer');
        console.log('Search Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('❌ Search Test Failed:', error);
    }
}

testSearch();
