# Content Module Documentation

## Overview

The Content Module manages various types of content within the application, including FAQs, Policies, and Application Contact information. This module provides a comprehensive set of features for handling static and dynamic content with multi-language support.

## Features

- FAQ Management (with multi-language support)
- Policy Management (Terms, Privacy, Refund policies)
- Application Contact Management
- Content Status Tracking
- SEO Metadata Management

## Entities

### AppContact

Manages application contact information across different platforms.

#### Properties:

- `type`: Enum (AppContactsEnum)
  - Available types: FACEBOOK, X, LINKEDIN, INSTAGRAM, WHATSAPP, PHONE_NUMBER, EMAIL
- `target`: String (contact information/link)

#### Constraints:

- Contact type must be unique
- Extends AppBaseEntity (includes id, createdAt, updatedAt, deletedAt)

### FAQ

Handles frequently asked questions with multi-language support.

#### Properties:

- `code`: String (indexed)
- `enQuestion`: String (English question)
- `arQuestion`: String (Arabic question)
- `enAnswer`: String (English answer)
- `arAnswer`: String (Arabic answer)
- `for`: FaqForEnum (ALL, USER, ADMIN)
- `status`: ContentStatusEnum (DRAFT, PUBLISHED, ARCHIVED)

#### Constraints:

- All text fields support long content (text type)
- Default visibility is ALL
- Default status is DRAFT

### Policy

Manages various types of policy documents with SEO support.

#### Properties:

- `type`: PolicyTypeEnum (TERMS, PRIVACY, REFUND, CUSTOM)
- `title`: String
- `description`: String
- `content`: String (HTML content)
- `metaTitle`: String (SEO)
- `metaDescription`: String (SEO)
- `metaKeywords`: String (Comma-separated SEO keywords)

#### Constraints:

- Policy type must be unique
- SEO fields are optional
- Extends AppBaseEntity

## Enums

### AppContactsEnum

Defines available contact types:

- FACEBOOK
- X
- LINKEDIN
- INSTAGRAM
- WHATSAPP
- PHONE_NUMBER
- EMAIL

### ContentStatusEnum

Tracks content publication status:

- DRAFT
- PUBLISHED
- ARCHIVED

### FaqForEnum

Defines FAQ visibility levels:

- ALL (visible to everyone)
- USER (visible to users only)
- ADMIN (visible to administrators only)

### PolicyTypeEnum

Defines types of policies:

- TERMS (Terms of Service)
- PRIVACY (Privacy Policy)
- REFUND (Refund Policy)
- CUSTOM (Custom Policy)

## GraphQL Integration

All entities are integrated with GraphQL using decorators:

- @ObjectType() for GraphQL type definition
- @Field() for GraphQL field exposure
- @Entity() for TypeORM entity definition

## Permissions

All entities use the @GeneratePermissions() decorator for automatic permission generation, enabling granular access control.

## Multi-language Support

The module supports both English (en) and Arabic (ar) content for:

- FAQ questions and answers
- Policy content can be managed in multiple languages through content field

## Data Structure

All entities inherit from AppBaseEntity, providing:

- Unique identifier (id)
- Creation timestamp (createdAt)
- Update timestamp (updatedAt)
- Soft delete support (deletedAt)
