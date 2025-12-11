Region module — full developer explanation (code-only)

Purpose

- The Region module manages countries and cities. It provides GraphQL resolvers, services, and DB entities to:
  - List and paginate registered countries and cities.
  - Register / unregister operating countries.
  - Create, update, delete city records.
  - Provide a static, localized country list for clients.

Module file (`region.module.ts`)

- Import: `AppDatabaseModule.forFeature([Country, City])` — registers `Country` and `City` with the app database module and enables repository injection tokens for each entity.
- Providers registered explicitly in the module:
  - `StaticCountryService`
  - `StaticCountryResolver`
  - `CountryService`
  - `CountryResolver`
  - `CityService`
  - `CityResolver`
  - `CountryDataloader`
- The module exports nothing (empty `exports: []`) and relies on DI for providers used within the application.

Services — exact signatures and behaviors

1. StaticCountryService (file: `services/static-country.service.ts`)

- Signature:
  - getStaticCountries(lang: LangEnum): StaticCountry[]
- Behavior:
  - Iterates `COUNTRIES` (project constant) using `Object.entries(COUNTRIES)`.
  - For each [key, value], pushes `{ code: key, name: lang == LangEnum.AR ? value.AR : value.EN }` into result array.
  - Returns the array of `StaticCountry` objects.
- Returned shape example (one element): `{ code: 'US', name: 'United States' }` (actual names come from `COUNTRIES`).

2. CountryService (file: `services/country.service.ts`)

- Constructor injection:
  - `@InjectAppRepository(Country) private readonly countryRepository: AppRepository<Country>`
- Methods and exact behavior:
  - getRegisteredCountries(paginatorInput?: PaginatorInput)
    - Calls `this.countryRepository.findPaginated(undefined, undefined, paginatorInput?.page, paginatorInput?.limit)` and returns the result.
    - No additional validation or transformation performed by this service method.
  - async registerOperatingCountry(countryCode: string): Promise<boolean>
    - Calls `await this.countryRepository.exists({ where: { countryCode } })`.
      - If `true`, throws `new AppHttpException(ErrorCodeEnum.COUNTRY_ALREADY_EXIST)`.
    - Reads `const country = COUNTRIES[countryCode]`.
      - If `!country` throws `new AppHttpException(ErrorCodeEnum.INVALID_COUNTRY_CODE)`.
    - Calls `await this.countryRepository.createOne({ countryCode, enName: country.EN, arName: country.AR })` to persist the new Country entity.
    - Returns `true` on success.
  - async unregisterOperatingCountry(id: string): Promise<boolean>
    - Calls `await this.countryRepository.findOne({ where: { id } })` to fetch the entity.
      - If missing, throws `new AppHttpException(ErrorCodeEnum.COUNTY_DOES_NOT_EXIST)`.
    - Calls `await this.countryRepository.remove(country)` to delete the entity.
    - Returns `true` on success.

- Exception cases thrown explicitly by this service (exact enum values/messages from code):
  - `ErrorCodeEnum.COUNTRY_ALREADY_EXIST` (when exists check is true)
  - `ErrorCodeEnum.INVALID_COUNTRY_CODE` (when provided countryCode is not in `COUNTRIES` constant)
  - `ErrorCodeEnum.COUNTY_DOES_NOT_EXIST` (when unregister finds no country with given id)

3. CityService (file: `services/city.service.ts`)

- Constructor injection:
  - `@InjectAppRepository(City) private readonly cityRepository: AppRepository<City>`
  - `@InjectAppRepository(Country) private readonly countryRepository: AppRepository<Country>`
- Methods and exact behavior (as implemented):
  - getCities(paginator?: PaginatorInput)
    - Returns `this.cityRepository.findPaginated(undefined, undefined, paginator?.page, paginator?.limit)`.
  - async getCity(id: string)
    - Calls `await this.cityRepository.findOne({ where: { id } })`.
    - If not found, throws `new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST)`.
    - Returns the `City` entity instance found.
  - async createCity(input: CreateCityInput): Promise<boolean>
    - Validates referenced country exists:
      - `const country = await this.countryRepository.findOne({ where: { id: input.countryId } })`.
      - If `!country` throws `new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, { message: 'Country not found' })`.
    - Validates unique city names:
      - Calls `await this.cityRepository.exists({ where: [ { arName: input.arName }, { enName: input.enName } ] })`.
      - If exists, throws `new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, { message: 'City name should be unique!' })`.
    - Calls `await this.cityRepository.createOne(input)` to persist the new city.
    - Returns `true` on success.
  - async updateCity(input: UpdateCityInput): Promise<boolean>
    - Finds existing city: `const city = await this.cityRepository.findOne({ where: { id: input.id } })`.
    - If not found, throws `new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST)`.
    - Calls `await this.cityRepository.updateOneFromExistingModel(city, input)` which applies fields from `input` to the existing entity and persists the change.
    - Returns `true` on success.
  - async deleteCity(cityId: string): Promise<boolean>
    - Finds existing city: `const city = await this.cityRepository.findOne({ where: { id: cityId } })`.
    - If not found, throws `new AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST)`.
    - Calls `await this.cityRepository.remove(city)` to delete the entity.
    - Returns `true` on success.

- Exception cases and explicit messages raised by the code:
  - `ErrorCodeEnum.CITY_DOES_NOT_EXIST` (when fetching a city by id fails)
  - `ErrorCodeEnum.BAD_REQUEST_EXCEPTION` with message `'Country not found'` (when referenced country id is missing)
  - `ErrorCodeEnum.BAD_REQUEST_EXCEPTION` with message `'City name should be unique!'` (when either arName or enName already exists)

Resolvers — exact mapping from GraphQL operations to service calls

1. StaticCountryResolver (`resolvers/static-country.resolver.ts`)

- Method signature in code:
  - @Query(() => [StaticCountry])
  - getStaticCountries(@Context() context: AppGqlContext)
- Behavior:
  - Reads `context.lang` and returns `this.staticCountryService.getStaticCountries(context.lang)`.
  - No additional transformation or error handling in resolver.

2. CountryResolver (`resolvers/country.resolver.ts`)

- Protectors and metadata (from code):
  - `@Auth({ roles: [UserRoleEnum.ADMIN], permissions: [{ target: Country.permissionsTarget, action: CountryPermissionEnum.READ }] })` on `adminGetRegisteredCountries`.
  - `@Auth({ roles: [UserRoleEnum.ADMIN], permissions: [{ target: Country.permissionsTarget, action: CountryPermissionEnum.REGISTER }] })` on `adminRegisterCountry`.
  - `@Auth({ roles: [UserRoleEnum.ADMIN], permissions: [{ target: Country.permissionsTarget, action: CountryPermissionEnum.UNREGISTER }] })` on `adminUnregisterCountry`.
- Methods and delegations:
  - adminGetRegisteredCountries(@Args() input: NullablePaginatorArgsInput)
    - Calls `return this.countryService.getRegisteredCountries(input.paginate)`.
    - Returns whatever `countryService.getRegisteredCountries` returns (no alteration in resolver).
  - adminRegisterCountry(@Args() input: RegisterOperatingCountryInput)
    - Calls `return this.countryService.registerOperatingCountry(input.countryCode)`.
  - adminUnregisterCountry(@Args() input: UnregisterOperatingCountry)
    - Calls `return this.countryService.unregisterOperatingCountry(input.id)`.

3. CityResolver (`resolvers/city.resolver.ts`)

- All admin methods are protected with `@Auth(...)` and annotated with `@Transactional()` in the code; each method delegates to `CityService`:
  - adminGetCity(@Args() input: GetCityInput) -> `this.cityService.getCity(input.id)`.
  - adminGetCities(@Args() input: NullablePaginatorArgsInput) -> `this.cityService.getCities(input.paginate)`.
  - adminCreateCity(@Args('input') input: CreateCityInput) -> `this.cityService.createCity(input)`.
  - adminUpdateCity(@Args('input') input: UpdateCityInput) -> `this.cityService.updateCity(input)`.
  - adminDeleteCity(@Args() input: SoftDeleteCityInput) -> `this.cityService.deleteCity(input.id)`.
- Resolve field for `country` on `City` objects:
  - Signature: `@ResolveField(() => Country) country(@Parent() city: City)`
  - Behavior in code:
    - If `city.country` is already loaded (truthy) the resolver returns it directly.
    - Otherwise it obtains a dataloader instance from `this.countryDataloader.getDataloader()` and calls `loader.load(city.countryId)`.
  - Dataloader behavior (from provider name and usage):
    - `CountryDataloader.getDataloader()` returns a DataLoader that batches multiple `countryId` values and loads `Country` entities in a single batch (the resolver uses `load(id)` per field to utilize batching).

Entities — exact fields and decorators

1. Country entity (`entities/country.entity.ts`)

- Declaration: `@Entity()`, `@ObjectType()`, `@GeneratePermissions(CountryPermissionEnum)`.
- Inherits: `AppBaseEntity` (base fields such as `id`, `createdAt`, `updatedAt`, `deletedAt` are on `AppBaseEntity`).
- Columns and GraphQL fields declared in code:
  - `@Column() @Field() countryCode: string;`
  - `@Column() @Field() enName: string;`
  - `@Column() @Field() arName: string;`
  - `@OneToMany(() => City, (city) => city.country) cities: City[];`
- Permission target:
  - `@GeneratePermissions(CountryPermissionEnum)` sets a static `permissionsTarget` used by the `@Auth()` decorator in resolvers.

2. City entity (`entities/city.entity.ts`)

- Declaration: `@Entity()`, `@ObjectType()`, `@GeneratePermissions()`.
- Inherits: `AppBaseEntity`.
- Columns and GraphQL fields in code:
  - `@Column({ unique: true }) @Field() arName: string;`
  - `@Column({ unique: true }) @Field() enName: string;`
  - `@Column({ type: 'enum', enum: CityStatusEnum }) @Field(() => CityStatusEnum) status: CityStatusEnum;`
  - `@Column() countryId: string;` (stored foreign key)
  - `@ManyToOne(() => Country, (country) => country.cities) country: Country;` (relation)
- `@GeneratePermissions()` without explicit enum uses the module/entity defaults to generate a `permissionsTarget`.

DTOs / Inputs — validation, messages, and types (exact decorators and messages from code)

- `StaticCountry` response (`dtos/responses/static-country.response.ts`)
  - GraphQL `@ObjectType()` with fields `code` and `name` both `@Field()` strings.

- `AdminGetRegisteredCountriesResponse` / `PaginatedCitiesResponse`
  - Created via `paginatedObjectTypeFactory(Entity)` which returns a GraphQL paginated object type for the given Entity.

- `CreateCityInput` (`dtos/inputs/create-city.input.ts`)
  - Fields and validation:
    - `@Field() @IsString() @IsNotEmpty() @Matches(ARABIC_LITTERS_REGEX, { message: 'Only AR liters are allowed' }) arName: string;`
    - `@Field() @IsString() @IsNotEmpty() @Matches(ENGLISH_LITTERS_REGEX, { message: 'Only EN liters are allowed' }) enName: string;`
    - `@Field(() => CityStatusEnum) status: CityStatusEnum;`
    - `@Field() @IsString() @IsNotEmpty() @IsUUID() countryId: string;`
  - Note: validator messages are the exact literal strings used in the code.

- `GetCityInput` (`dtos/inputs/get-city.input.ts`)
  - `@ArgsType()` with `@Field() @IsString() @IsUUID() id: string;`

- `RegisterOperatingCountryInput` (`dtos/inputs/register-operating-country.input.ts`)
  - `@ArgsType()` with `@Field() @IsString() @IsNotEmpty() @Length(2,2) @Matches(ENGLISH_CAPITAL_LITTERS_REGEX, { message: 'Value Must be English UpperCase' }) countryCode: string;`

- `SoftDeleteCityInput`, `UnregisterOperatingCountry`
  - Both are `@ArgsType()` classes with `@Field() @IsString() @IsNotEmpty() @IsUUID() id: string;` as in the attachments.

- `UpdateCityInput` (`dtos/inputs/update-city.input.ts`)
  - Extends `PartialType(CreateCityInput)` and adds `@Field() @IsString() @IsNotEmpty() @IsUUID() id: string;` so the input is partial for city fields plus required `id`.

Repository and DI tokens (how service receives repositories)

- `AppDatabaseModule.forFeature([Country, City])` registers injection tokens for repositories for those entities. The code uses `@InjectAppRepository(Entity)` decorator which resolves to `AppRepository<Entity>`.
- Services call repository methods such as:
  - `exists({ where })` — boolean existence check
  - `findOne({ where })` — returns entity or undefined
  - `findPaginated(...)` — returns a paginated object (the module uses a paginated factory for responses)
  - `createOne(payload)` — creates and persists an entity
  - `updateOneFromExistingModel(model, payload)` — applies partial payload to existing model and persists
  - `remove(entity)` — deletes the entity

Dataloader details used by resolver

- `CountryDataloader` provider (in module providers) exposes `getDataloader()` in code.
- `CityResolver` uses `CountryDataloader.getDataloader().load(city.countryId)` when `city.country` is not already loaded. This means the GraphQL field resolver defers loading to a DataLoader which will batch multiple `load(id)` calls across the same tick into a single batched DB request.

Error codes and thrown exceptions (exact from code)

- CountryService throws:
  - `AppHttpException(ErrorCodeEnum.COUNTRY_ALREADY_EXIST)`
  - `AppHttpException(ErrorCodeEnum.INVALID_COUNTRY_CODE)`
  - `AppHttpException(ErrorCodeEnum.COUNTY_DOES_NOT_EXIST)`
- CityService throws:
  - `AppHttpException(ErrorCodeEnum.CITY_DOES_NOT_EXIST)`
  - `AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, { message: 'Country not found' })`
  - `AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, { message: 'City name should be unique!' })`

References (exact file paths used in code)

- Module: `src/modules/app/region/region.module.ts`
- Services: `src/modules/app/region/services/static-country.service.ts`, `src/modules/app/region/services/country.service.ts`, `src/modules/app/region/services/city.service.ts`
- Resolvers: `src/modules/app/region/resolvers/static-country.resolver.ts`, `src/modules/app/region/resolvers/country.resolver.ts`, `src/modules/app/region/resolvers/ city.resolver.ts`
- Entities: `src/modules/app/region/entities/country.entity.ts`, `src/modules/app/region/entities/city.entity.ts`
- DTOs / Inputs: `src/modules/app/region/dtos/inputs/*`, `src/modules/app/region/dtos/responses/*`
- Enums: `src/modules/app/region/enums/*`

Files used to build this document: attachments provided by the user (module, services, resolvers, entities).
