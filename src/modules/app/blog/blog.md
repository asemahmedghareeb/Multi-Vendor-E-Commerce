## Blog Module Documentation

### Overview

The Blog Module delivers the platform features needed to manage editorial content, including blog posts, hierarchical categories, reusable tags, media assets, metadata, and legacy slug redirects. It exposes a GraphQL API secured by role-based permissions and relies on the shared application database infrastructure for persistence and soft-deletion support.

### Module Composition

- **Module definition:** `blog.module.ts` registers the ORM entities, exposes request-scoped providers, and wires services and resolvers.
- **Database integration:** Uses `AppDatabaseModule.forFeature` to bind the Blog-related entities to the application TypeORM connection.
- **Providers:**
  - Services: `BlogService`, `BlogCategoryService`, `TagService`
  - Resolvers: `BlogResolver`, `BlogCategoryResolver`, `TagResolver`
  - Dataloader: `BlogCategoryDataloader`

### Domain Model

All entities extend `AppBaseEntity`, inheriting audit columns (`id`, timestamps, soft-delete markers) and permission metadata via `@GeneratePermissions` where applied.

#### `Blog`

- Localized titles: `enTitle`, `arTitle`
- Unique `slug` for routing
- Publication controls: `status` (`BlogStatusEnum`), `publishedDate`
- Localized HTML bodies: `enHtmlBody`, `arHtmlBody`
- Relations:
  - `ManyToOne` → `BlogCategory` (`categoryId`)
  - `ManyToOne` → `User` (`authorId`)
  - `OneToOne` → `BlogMetadata`
  - `OneToMany` → `BlogMedia[]`
  - `OneToMany` → `BlogTag[]`

#### `BlogCategory`

- Unique `slug`, localized names (`enName`, `arName`)
- Self-referencing optional parent (`parentId`) enabling nested categories
- Computed field `isParent` derived from the absence of `parentId`
- Relation to `Blog` entries via `blogs`

#### `Tag`

- Localized names (`enName`, `arName`) and `slug`
- `OneToMany` relation with `BlogTag` join entities

#### `BlogTag`

- Join table connecting `Blog` and `Tag`
- Stores `blogId` and `tagId`; both sides configured with `ManyToOne` associations

#### `BlogMedia`

- Asset metadata: `altText`, `caption`, `type` (`BlogMediaTypeEnum`)
- Links to the owning `Blog` (`blogId`) and optional media `File` (`fileId`)

#### `BlogMetadata`

- SEO fields (`metaTitle`, `metaDescription`, `metaKeywords`)
- Channel-specific metadata such as `canonicalUrl`, Open Graph, and Twitter card properties
- `OneToOne` relation with `Blog`

#### `SlugRedirects`

- Records legacy → current slug mappings via `oldSlug` and `newSlug`

### Enumerations

- `BlogStatusEnum`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `BlogContentStatusEnum`: `ACTIVE`, `INACTIVE` (available for components that manage content visibility states)
- `BlogMediaTypeEnum`: `IMAGE`, `VIDEO`

Each enum is registered with GraphQL ensuring type-safe schema exposure.

### GraphQL Inputs and Responses

- `BlogInput`: Core blog authoring payload (titles, slug, status, publish date, body content, author association).
- `BlogMetadataInput`: Optional SEO and social metadata fields, each validated for type and max length where applicable.
- `BlogMediaInput`: Data required to attach media assets to a blog entry.
- Category inputs:
  - `CreateBlogCategoryInput`
  - `UpdateBlogCategoryInput` (extends the create payload with an `id` field)
  - `GetSingleCategoryInput`
  - `SoftRemoveBlogCategoryInput`
- Tag inputs mirror category inputs with analogous DTOs (`CreateTagInput`, `UpdateTagInput`, `GetSingleTagInput`, `SoftRemoveTagInput`).
- Pagination responses leverage the shared `paginatedObjectTypeFactory` to produce `PaginatedBlogCategoriesResponse` and `PaginatedTagsResponse` types with `items` and `pageInfo` fields.

Validation on all input types is implemented via `class-validator`, enforcing string requirements, UUID formats for identifiers, and maximum lengths for user-facing fields.

### Services

- **`BlogCategoryService`**
  - Creates categories with optional parent linkage while validating parent existence and preventing cyclic relationships.
  - Enforces slug uniqueness (including soft-deleted records) and handles updates with prospective slug changes.
  - Provides paginated listing, single retrieval, and soft deletion operations.
- **`TagService`**
  - Manages tag lifecycle (create, update, paginate, retrieve, soft delete) with slug uniqueness checks.
- **`BlogService`**
  - Placeholder for blog-specific business logic (repository injection prepared for future expansion).

All service methods communicate domain failures via `AppHttpException` coupled with `ErrorCodeEnum` values for consistent error surfaces.

### Resolvers

- **`BlogCategoryResolver`**
  - Queries: `getPaginatedBlogCategories`, `getSingleBlogCategory`
  - Mutations (admin-only with role + permission guard): `adminCreateBlogCategory`, `adminUpdateBlogCategory`, `adminSoftDeleteBlogCategory`
  - Resolve field `parentBlogCategory` uses the dataloader to efficiently hydrate parent categories when not already present.
- **`TagResolver`**
  - Queries: `getSingleTag`, `getPaginatedTags`
  - Mutations: `adminCreateTag`, `adminUpdateTag`, `adminSoftRemoveTag`
- **`BlogResolver`**
  - Reserved for blog-level GraphQL operations; currently prepared for future query and mutation definitions via `BlogService`.

Authentication is enforced using the `@Auth` decorator, requiring `UserRoleEnum.ADMIN` and matching permission actions (`CREATE`, `UPDATE`, `DELETE`) against the entity-specific permission target generated by `@GeneratePermissions`.

### Dataloader Strategy

`BlogCategoryDataloader` is request-scoped and batches category lookups to avoid N+1 queries when resolving parent categories. It leverages the shared `AppRepository` to fetch categories by IDs (including soft-deleted records) and returns the results in the order requested.

### Workflows

- **Category management:**
  1.  Admin invokes `adminCreateBlogCategory` with localized names and optional parent ID.
  2.  Service validates parent eligibility and slug uniqueness, then persists the category.
  3.  Pagination and single lookup queries provide read access for both admin and public use cases.
  4.  Updates follow a similar path with additional slug collision validation; soft deletion marks categories without hard removal.
- **Tag management:**
  1.  Admin creates tags through `adminCreateTag`, providing localized labels and slug.
  2.  Tag updates and deletions are guarded by slug checks and soft removal to preserve historical associations.
- **Blog authoring:**
  - `BlogInput`, `BlogMetadataInput`, and `BlogMediaInput` define the shape of authoring payloads. While resolver mutations are not yet implemented, the data structures, services, and entities required for full CRUD support are in place.
- **Slug migrations:**
  - `SlugRedirects` entities allow storing mapping records when blog slugs change, ensuring external links can be redirected.

### Data Integrity and Error Handling

- Slug uniqueness is enforced across categories and tags, considering soft-deleted entries to prevent accidental reuse.
- Parent category validation ensures only top-level categories can parent children and prevents linking a category as its own ancestor.
- Soft delete operations retain historical data while excluding it from standard listings, consistent with the base repository behavior.

### GraphQL Exposure

- Entities and enums are decorated to expose GraphQL object types and fields, aligning with the schema generated in `schema.gql`.
- Timestamp fields utilize the shared `TimestampScalar` for consistent serialization.

### Security and Permissions

- Administrative mutations require both the `ADMIN` role and explicit permission actions tied to the module’s entities.
- The auto-generated permission targets ensure centralized governance aligned with the platform’s authorization model.

This documentation summarizes the current implementation of the Blog Module, highlighting its entities, inputs, resolvers, and supporting infrastructure for managing blog content within the application.
