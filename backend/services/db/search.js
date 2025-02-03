import {
  Chat,
  Challenge,
  Pages,
  Transaction,
  Breaker,
  SocialBounty,
  Submission,
} from "../../models/Models.js";
import dotenv from "dotenv";
import { agentValidator } from "../../validators/agentValidator.js";
import Mongoose from "mongoose";
dotenv.config();

class SearchQueryBuilder {
  constructor() {
    this.query = {
      filter: [],
      must: [],
      should: [],
      sort: {},
    };
  }

  // Add text search conditions (OR)
  addOrConditions(conditions) {
    if (!conditions || Object.keys(conditions).length === 0) return this;

    const shouldClauses = Object.entries(conditions)
      .filter(([_, value]) => value) // Filter out empty values
      .map(([field, value]) => ({
        text: {
          query: value,
          path: field,
        },
      }));

    if (shouldClauses.length > 0) {
      this.query.should.push(...shouldClauses);
    }

    return this;
  }

  // Add text search conditions (AND)
  addAndConditions(conditions) {
    if (!conditions || Object.keys(conditions).length === 0) return this;

    const mustClauses = Object.entries(conditions)
      .filter(([_, value]) => value !== undefined && value !== "") // Filter out empty values
      .map(([field, value]) => {
        // Handle boolean values
        if (typeof value === "boolean") {
          return {
            equals: {
              path: field,
              value: value,
            },
          };
        }
        // Handle text values (existing logic)
        return {
          text: {
            query: value,
            path: field,
          },
        };
      });

    if (mustClauses.length > 0) {
      this.query.must.push(...mustClauses);
    }

    return this;
  }

  // Modified date range filter to support cursor pagination
  addDateRange(startDate, endDate, lastDate, lastId) {
    if (!startDate && !endDate && !lastDate && !lastId) return this;

    const dateFilters = [];

    // Base date range if provided
    if (startDate || endDate) {
      dateFilters.push({
        range: {
          path: "date",
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      });
    }

    // Pagination filter
    if (lastDate && lastId) {
      dateFilters.push({
        range: {
          path: "date",
          lt: new Date(lastDate),
        },
      });

      // Add _id comparison for same-date documents
      dateFilters.push({
        range: {
          path: "_id",
          lt: new Mongoose.Types.ObjectId(lastId),
        },
      });
    }

    // Add all filters to the must array to ensure AND behavior
    if (dateFilters.length > 0) {
      this.query.must.push(...dateFilters);
    }

    return this;
  }

  // Modified sort to always include _id for consistent pagination
  addSort(field = "date", order = "asc") {
    this.query.sort = {
      [field]: order === "asc" ? 1 : -1,
      _id: order === "asc" ? 1 : -1,
    };
    return this;
  }

  // Build the final query
  build() {
    const finalQuery = {
      compound: {},
    };

    if (this.query.must.length > 0) {
      finalQuery.compound.must = this.query.must;
    }

    if (this.query.should.length > 0) {
      finalQuery.compound.should = this.query.should;
      finalQuery.compound.minimumShouldMatch = 1;
    }

    if (this.query.filter.length > 0) {
      finalQuery.compound.filter = this.query.filter;
    }

    if (this.query.sort?._id) {
      finalQuery.sort = this.query.sort;
    }

    return finalQuery;
  }
}

// Example usage service
class SearchService {
  constructor(collection) {
    this.collection = collection;
  }

  encodeCursor(cursor) {
    if (!cursor) return null;
    return Buffer.from(JSON.stringify(cursor)).toString("base64");
  }

  // Helper method to decode cursor
  decodeCursor(token) {
    if (!token) return null;
    try {
      return JSON.parse(Buffer.from(token, "base64").toString());
    } catch (error) {
      console.error("Invalid cursor token:", error);
      return null;
    }
  }

  async search({
    orConditions = {},
    andConditions = {},
    startDate,
    endDate,
    cursor,
    sortField = "date",
    sortOrder = "desc",
    limit,
  }) {
    try {
      const { lastDate, lastId } = this.decodeCursor(cursor) || {};

      const queryBuilder = new SearchQueryBuilder()
        .addOrConditions(orConditions)
        .addAndConditions(andConditions)
        .addDateRange(startDate, endDate, lastDate, lastId)
        .addSort(sortField, sortOrder);

      const searchQuery = queryBuilder.build();

      const results = await this.collection.aggregate([
        {
          $search: {
            index: "conversations_index",
            compound: searchQuery.compound,
            sort: searchQuery.sort,
          },
        },
        {
          $limit: limit + 1,
        },
        {
          $project: {
            _id: 1,
            address: 1,
            challenge: 1,
            content: 1,
            date: 1,
            role: 1,
            win: 1,
            // Add other fields you need
          },
        },
      ]);

      let nextCursor = null;
      if (results.length > limit) {
        const lastDoc = results[limit];
        nextCursor = this.encodeCursor({
          lastDate: lastDoc.date,
          lastId: lastDoc._id,
        });
        results.pop();
      }

      return {
        results,
        nextCursor,
      };
    } catch (error) {
      console.error("Search Service Error:", error);
      throw error;
    }
  }
}

class SearchDBService {
  constructor(collection) {
    this.searchService = new SearchService(collection);
  }

  async getChallengeConversations(challenge, options = {}) {
    try {
      const {
        address,
        content,
        role,
        win,
        startDate,
        endDate,
        sortField,
        sortOrder,
        cursor,
        limit = 20,
      } = options;

      const orConditions = {};

      const andConditions = {
        challenge,
        address,
        content,
        role,
        win,
      };

      return await this.searchService.search({
        orConditions,
        andConditions,
        startDate,
        endDate,
        cursor,
        sortField,
        sortOrder,
        limit,
      });
    } catch (error) {
      console.error("Database Service Error:", error);
      return false;
    }
  }
}

export default SearchDBService;
